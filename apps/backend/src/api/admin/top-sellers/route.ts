import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const topSellerService = req.scope.resolve("topSeller") as any

  const topSellers = await topSellerService.listTopSellers(
    {},
    { order: { sort_order: "ASC" } }
  )

  res.json({ top_sellers: topSellers })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const topSellerService = req.scope.resolve("topSeller") as any
  const { product_id, sort_order = 0, is_active = true, badge_type, badge_visible = true, compare_at_price } = req.body as any

  const existing = await topSellerService.listTopSellers({ product_id })

  if (existing.length > 0) {
    const updated = await topSellerService.updateTopSellers({
      id: existing[0].id,
      sort_order,
      is_active,
      badge_type: badge_type || null,
      badge_visible,
      compare_at_price: compare_at_price || null,
    })
    res.json({ top_seller: updated })
    return
  }

  const created = await topSellerService.createTopSellers({
    product_id,
    sort_order,
    is_active,
    badge_type: badge_type || null,
    badge_visible,
    compare_at_price: compare_at_price || null,
  })

  res.json({ top_seller: created })
}
