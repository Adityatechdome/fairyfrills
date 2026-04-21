/**
 * Bulk Add Size Variants Script
 *
 * Replaces every product's "Default variant" with 18 size variants.
 * Each size variant is priced at the product's existing base INR price.
 *
 * Run with:
 *   npx medusa exec src/scripts/bulk-add-size-variants.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
  createProductVariantsWorkflow,
  deleteProductVariantsWorkflow,
} from "@medusajs/medusa/core-flows"

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

export default async function ({ container }: ExecArgs) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const query = container.resolve("query")

  // Fetch all products with their current options, variants, and prices
  let allProducts: any[] = []
  let offset = 0
  const pageSize = 50

  while (true) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "options.id",
        "options.title",
        "variants.id",
        "variants.prices.*",
      ],
      pagination: { take: pageSize, skip: offset },
    })
    allProducts = allProducts.concat(data)
    if (data.length < pageSize) break
    offset += pageSize
  }

  console.log(`Found ${allProducts.length} products to process.`)

  let processed = 0
  let skipped = 0
  let failed = 0

  for (const product of allProducts) {
    try {
      // Skip products that already have a "Size" option
      const hasSizeOption = product.options?.some(
        (o: any) => o.title === "Size"
      )
      if (hasSizeOption) {
        console.log(`SKIP (already has Size): ${product.title}`)
        skipped++
        continue
      }

      // Extract base price from the existing default variant (INR)
      const existingVariant = product.variants?.[0]
      const basePrice: number =
        existingVariant?.prices?.find((p: any) => p.currency_code === "inr")
          ?.amount ?? 0

      // 1. Delete old variants via workflow (cleans up price links too)
      const oldVariantIds: string[] = (product.variants ?? []).map(
        (v: any) => v.id as string
      )
      if (oldVariantIds.length > 0) {
        await deleteProductVariantsWorkflow(container).run({
          input: { ids: oldVariantIds },
        })
      }

      // 2. Delete old options (must be done after variants are gone)
      const oldOptionIds: string[] = (product.options ?? []).map(
        (o: any) => o.id as string
      )
      if (oldOptionIds.length > 0) {
        await productModuleService.deleteProductOptions(oldOptionIds)
      }

      // 3. Create the "Size" product option
      await productModuleService.upsertProducts([
        {
          id: product.id,
          options: [{ title: "Size", values: SIZES }],
        },
      ])

      // 4. Create all 18 size variants with prices via workflow
      const productVariants = SIZES.map((size, index) => ({
        product_id: product.id,
        title: size,
        options: { Size: size },
        manage_inventory: false,
        variant_rank: index,
        prices: [
          {
            currency_code: "inr",
            amount: basePrice,
          },
        ],
      }))

      await createProductVariantsWorkflow(container).run({
        input: { product_variants: productVariants },
      })

      processed++
      if (processed % 10 === 0) {
        console.log(
          `Progress: ${processed} done, ${skipped} skipped, ${failed} failed...`
        )
      }
    } catch (err: any) {
      console.error(
        `FAILED: ${product.title} (${product.id}) — ${err.message}`
      )
      failed++
    }
  }

  console.log(`\n========= DONE =========`)
  console.log(`  Processed: ${processed}`)
  console.log(`  Skipped (already had Size option): ${skipped}`)
  console.log(`  Failed: ${failed}`)
  console.log(`  Total: ${allProducts.length}`)
}
