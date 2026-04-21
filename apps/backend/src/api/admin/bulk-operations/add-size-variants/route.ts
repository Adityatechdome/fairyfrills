import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
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

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  const query = req.scope.resolve("query")

  // Fetch all products paginated
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

  let processed = 0
  let skipped = 0
  let failed = 0
  const errors: string[] = []

  for (const product of allProducts) {
    try {
      const hasSizeOption = product.options?.some(
        (o: any) => o.title === "Size"
      )
      if (hasSizeOption) {
        skipped++
        continue
      }

      const existingVariant = product.variants?.[0]
      const basePrice: number =
        existingVariant?.prices?.find((p: any) => p.currency_code === "inr")
          ?.amount ?? 0

      const oldVariantIds: string[] = (product.variants ?? []).map(
        (v: any) => v.id as string
      )
      if (oldVariantIds.length > 0) {
        await deleteProductVariantsWorkflow(req.scope).run({
          input: { ids: oldVariantIds },
        })
      }

      const oldOptionIds: string[] = (product.options ?? []).map(
        (o: any) => o.id as string
      )
      if (oldOptionIds.length > 0) {
        await productModuleService.deleteProductOptions(oldOptionIds)
      }

      await productModuleService.upsertProducts([
        {
          id: product.id,
          options: [{ title: "Size", values: SIZES }],
        },
      ])

      const productVariants = SIZES.map((size, index) => ({
        product_id: product.id,
        title: size,
        options: { Size: size },
        manage_inventory: false,
        variant_rank: index,
        prices: [{ currency_code: "inr", amount: basePrice }],
      }))

      await createProductVariantsWorkflow(req.scope).run({
        input: { product_variants: productVariants },
      })

      processed++
    } catch (err: any) {
      errors.push(`${product.title}: ${err.message}`)
      failed++
    }
  }

  res.json({
    success: true,
    total: allProducts.length,
    processed,
    skipped,
    failed,
    errors,
  })
}
