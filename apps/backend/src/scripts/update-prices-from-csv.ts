/**
 * Update Variant Prices from CSV Script
 *
 * Reads a product-prices.csv file and updates each matching variant's price.
 *
 * CSV format (no spaces around commas):
 *   Product Name,Variant Size,Price
 *   Glamorous Chocolate Sequin Layered,9-10 yrs,9499.50
 *
 * Pricing rule:
 *   - If a product has CSV rows for some sizes but not all, the sizes missing
 *     from the CSV inherit the LAST price listed in the CSV for that product
 *     (NOT the original base price).
 *
 * Place your CSV at: apps/backend/product-prices.csv
 *
 * Run with:
 *   npx medusa exec src/scripts/update-prices-from-csv.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import * as fs from "fs"
import * as readline from "readline"

const SIZES = [
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "1-2 yrs",
  "2-3 yrs",
  "3-4 yrs",
  "4-5 yrs",
  "5-6 yrs",
  "6-7 yrs",
  "7-8 yrs",
  "8-9 yrs",
  "9-10 yrs",
  "10-11 yrs",
  "11-12 yrs",
  "12-13 yrs",
  "13-14 yrs",
  "14-15 yrs",
  "15-16 yrs",
]

type CsvRow = { productName: string; size: string; price: number }

async function readCsv(filePath: string): Promise<CsvRow[]> {
  const rows: CsvRow[] = []
  const fileStream = fs.createReadStream(filePath)
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity })

  let isFirstLine = true
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false
      continue // skip header row
    }
    const trimmed = line.trim()
    if (!trimmed) continue

    // Split on first two commas only, so product names containing commas are handled
    const firstComma = trimmed.indexOf(",")
    const secondComma = trimmed.indexOf(",", firstComma + 1)
    if (firstComma === -1 || secondComma === -1) {
      console.warn(`Skipping malformed line: ${trimmed}`)
      continue
    }

    const productName = trimmed.substring(0, firstComma).trim()
    const size = trimmed.substring(firstComma + 1, secondComma).trim()
    const priceStr = trimmed.substring(secondComma + 1).trim()
    const price = parseFloat(priceStr)

    if (!productName || !size || isNaN(price)) {
      console.warn(`Skipping invalid line: ${trimmed}`)
      continue
    }

    rows.push({ productName, size, price })
  }

  return rows
}

export default async function ({ container }: ExecArgs) {
  // Locate the CSV file
  const csvPath = "/workspace/apps/backend/product-prices.csv"

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at: ${csvPath}`)
    console.error(`Place your product-prices.csv file in: apps/backend/product-prices.csv`)
    process.exit(1)
  }

  console.log(`Reading CSV from: ${csvPath}`)
  const rows = await readCsv(csvPath)
  console.log(`Loaded ${rows.length} rows from CSV.`)

  if (rows.length === 0) {
    console.log("No rows to process.")
    return
  }

  // Group CSV rows by product name: productName -> (size -> price)
  // Preserve insertion order so we can find the "last" price for a product
  const csvByProduct = new Map<string, Map<string, number>>()
  for (const row of rows) {
    const key = row.productName.toLowerCase().trim()
    if (!csvByProduct.has(key)) {
      csvByProduct.set(key, new Map())
    }
    csvByProduct.get(key)!.set(row.size, row.price)
  }

  const query = container.resolve("query")

  // Fetch all products with their variants and prices
  let allProducts: any[] = []
  let offset = 0
  const pageSize = 50

  while (true) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "variants.id",
        "variants.title",
        "variants.prices.*",
      ],
      pagination: { take: pageSize, skip: offset },
    })
    allProducts = allProducts.concat(data)
    if (data.length < pageSize) break
    offset += pageSize
  }

  console.log(`Found ${allProducts.length} products in database.`)

  // Build a lookup: lowercase title -> product
  const productByTitle = new Map<string, any>()
  for (const p of allProducts) {
    productByTitle.set(p.title.toLowerCase().trim(), p)
  }

  let updated = 0
  let notFound = 0
  let failed = 0

  for (const [csvProductKey, csvSizePrices] of csvByProduct.entries()) {
    // Try exact match first, then partial match
    let targetProduct: any = productByTitle.get(csvProductKey)

    if (!targetProduct) {
      for (const [dbKey, dbProduct] of productByTitle.entries()) {
        if (
          dbKey.startsWith(csvProductKey) ||
          csvProductKey.startsWith(dbKey)
        ) {
          targetProduct = dbProduct
          console.log(`Partial match: "${csvProductKey}" -> "${dbProduct.title}"`)
          break
        }
      }
    }

    if (!targetProduct) {
      console.warn(`NOT FOUND in DB: "${csvProductKey}"`)
      notFound++
      continue
    }

    try {
      // Find the last price that appears in the CSV for this product
      // (for sizes not listed in the CSV, we use this as the fallback)
      const csvSizeOrder = SIZES.filter((s) => csvSizePrices.has(s))
      const lastCsvPrice =
        csvSizeOrder.length > 0
          ? csvSizePrices.get(csvSizeOrder[csvSizeOrder.length - 1])!
          : null

      if (lastCsvPrice === null) {
        console.warn(`No valid size prices found in CSV for: ${targetProduct.title}`)
        continue
      }

      // Build update payload: one entry per variant
      const productVariants: {
        id: string
        prices: { currency_code: string; amount: number }[]
      }[] = []

      for (const variant of targetProduct.variants ?? []) {
        const variantSize = variant.title as string

        let targetPrice: number
        if (csvSizePrices.has(variantSize)) {
          targetPrice = csvSizePrices.get(variantSize)!
        } else {
          // Size not explicitly listed — inherit the last CSV price
          targetPrice = lastCsvPrice
        }

        productVariants.push({
          id: variant.id,
          prices: [
            {
              currency_code: "inr",
              amount: Math.round(targetPrice),
            },
          ],
        })
      }

      if (productVariants.length === 0) continue

      await updateProductVariantsWorkflow(container).run({
        input: { product_variants: productVariants },
      })

      console.log(
        `Updated ${productVariants.length} variant prices for: ${targetProduct.title}`
      )
      updated++
    } catch (err: any) {
      console.error(`FAILED for "${targetProduct.title}": ${err.message}`)
      failed++
    }
  }

  console.log(`\n========= DONE =========`)
  console.log(`  Products updated: ${updated}`)
  console.log(`  Products not found in DB: ${notFound}`)
  console.log(`  Failed: ${failed}`)
}
