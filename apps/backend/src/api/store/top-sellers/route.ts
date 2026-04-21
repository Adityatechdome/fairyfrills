import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QueryContext } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const topSellerService = req.scope.resolve("topSeller") as any
  const query = req.scope.resolve("query") as any

  const topSellers = await topSellerService.listTopSellers(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  if (topSellers.length === 0) {
    return res.json({ products: [] })
  }

  const productIds = topSellers.map((ts: any) => ts.product_id)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "images.*",
      "variants.*",
      "variants.calculated_price.*",
    ],
    filters: {
      id: productIds,
    },
    context: {
      variants: {
        calculated_price: QueryContext({
          currency_code: "inr",
        }),
      },
    },
  })

  const sortedProducts = productIds
    .map((pid: string) => {
      const product = products.find((p: any) => p.id === pid)
      const topSellerData = topSellers.find((ts: any) => ts.product_id === pid)
      if (product && topSellerData) {
        return {
          ...product,
          top_seller: {
            badge_type: topSellerData.badge_type,
            badge_visible: topSellerData.badge_visible,
            compare_at_price: topSellerData.compare_at_price,
          }
        }
      }
      return product
    })
    .filter(Boolean)

  return res.json({ products: sortedProducts })
}
