import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")

  const slides = await heroSlideService.listHeroSlides(
    { is_active: true },
    { order: { sort_order: "ASC", created_at: "DESC" } }
  )

  return res.json({ slides })
}
