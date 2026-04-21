import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

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

function parseCsv(csvText: string): CsvRow[] {
  const rows: CsvRow[] = []
  const lines = csvText.split(/\r?\n/)
  let isFirst = true

  for (const line of lines) {
    if (isFirst) { isFirst = false; continue } // skip header
    const trimmed = line.trim()
    if (!trimmed) continue

    const firstComma = trimmed.indexOf(",")
    const secondComma = trimmed.indexOf(",", firstComma + 1)
    if (firstComma === -1 || secondComma === -1) continue

    const productName = trimmed.substring(0, firstComma).trim()
    const size = trimmed.substring(firstComma + 1, secondComma).trim()
    const priceStr = trimmed.substring(secondComma + 1).trim()
    const price = parseFloat(priceStr)

    if (!productName || !size || isNaN(price)) continue
    rows.push({ productName, size, price })
  }

  return rows
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { csv_content } = req.body as { csv_content?: string }

  if (!csv_content || typeof csv_content !== "string" || !csv_content.trim()) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "csv_content is required")
  }

  const rows = parseCsv(csv_content)
  if (rows.length === 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No valid rows found in CSV")
  }

  // Group: productName (lowercase) -> (size -> price)
  const csvByProduct = new Map<string, Map<string, number>>()
  for (const row of rows) {
    const key = row.productName.toLowerCase().trim()
    if (!csvByProduct.has(key)) csvByProduct.set(key, new Map())
    csvByProduct.get(key)!.set(row.size.toLowerCase().trim(), row.price)
  }

  const query = req.scope.resolve("query")

  let allProducts: any[] = []
  let offset = 0
  const pageSize = 50

  while (true) {
    const { data } = await query.graph({
      entity: "product",
      fields: ["id", "title", "variants.id", "variants.title", "variants.prices.*"],
      pagination: { take: pageSize, skip: offset },
    })
    allProducts = allProducts.concat(data)
    if (data.length < pageSize) break
    offset += pageSize
  }

  const productByTitle = new Map<string, any>()
  for (const p of allProducts) {
    productByTitle.set(p.title.toLowerCase().trim(), p)
  }

  let updated = 0
  let notFound = 0
  let failed = 0
  const notFoundList: string[] = []
  const errors: string[] = []

  for (const [csvKey, csvSizePrices] of csvByProduct.entries()) {
    let targetProduct: any = productByTitle.get(csvKey)

    if (!targetProduct) {
      for (const [dbKey, dbProduct] of productByTitle.entries()) {
        if (dbKey.startsWith(csvKey) || csvKey.startsWith(dbKey)) {
          targetProduct = dbProduct
          break
        }
      }
    }

    if (!targetProduct) {
      notFoundList.push(csvKey)
      notFound++
      continue
    }

    try {
      const csvSizeOrder = SIZES.filter((s) => csvSizePrices.has(s.toLowerCase()))
      const lastCsvPrice =
        csvSizeOrder.length > 0
          ? csvSizePrices.get(csvSizeOrder[csvSizeOrder.length - 1].toLowerCase())!
          : null

      if (lastCsvPrice === null) continue

      const productVariants: { id: string; prices: { currency_code: string; amount: number }[] }[] = []

      for (const variant of targetProduct.variants ?? []) {
        const variantSize = (variant.title as string).toLowerCase().trim()
        const targetPrice = csvSizePrices.has(variantSize)
          ? csvSizePrices.get(variantSize)!
          : lastCsvPrice

        productVariants.push({
          id: variant.id,
          prices: [{ currency_code: "inr", amount: Math.round(targetPrice) }],
        })
      }

      if (productVariants.length === 0) continue

      await updateProductVariantsWorkflow(req.scope).run({
        input: { product_variants: productVariants },
      })

      updated++
    } catch (err: any) {
      errors.push(`${targetProduct.title}: ${err.message}`)
      failed++
    }
  }

  res.json({
    success: true,
    csv_rows: rows.length,
    products_in_csv: csvByProduct.size,
    updated,
    not_found: notFound,
    not_found_list: notFoundList,
    failed,
    errors,
  })
}
