import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { IProductModuleService } from "@medusajs/framework/types"

const DEFAULT_SIZES = [
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

createProductsWorkflow.hooks.productsCreated(
  async ({ products }, { container }) => {
    const productModuleService =
      container.resolve<IProductModuleService>(Modules.PRODUCT)

    for (const product of products) {
      // Skip if product already has custom options defined
      if (product.options && product.options.length > 0) {
        continue
      }

      await productModuleService.upsertProducts([
        {
          id: product.id,
          options: [
            {
              title: "Size",
              values: DEFAULT_SIZES,
            },
          ],
          variants: DEFAULT_SIZES.map((size) => ({
            title: size,
            options: { Size: size },
            manage_inventory: false,
          })),
        },
      ])
    }

    return new StepResponse(products, { productIds: products.map((p) => p.id) })
  },
  async (compensationData, { container }) => {
    const productIds =
      (compensationData as { productIds: string[] })?.productIds ?? []
    const productModuleService =
      container.resolve<IProductModuleService>(Modules.PRODUCT)

    for (const productId of productIds) {
      const [product] = await productModuleService.listProducts(
        { id: productId },
        { relations: ["options", "variants"] }
      )
      if (!product) continue

      if (product.variants?.length) {
        await productModuleService.deleteProductVariants(
          product.variants.map((v) => v.id)
        )
      }
      if (product.options?.length) {
        await productModuleService.deleteProductOptions(
          product.options.map((o) => o.id)
        )
      }
    }
  }
)
