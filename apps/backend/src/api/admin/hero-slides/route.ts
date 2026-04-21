import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")
  const slides = await heroSlideService.listHeroSlides(
    {},
    { order: { sort_order: "ASC", created_at: "DESC" } }
  )
  res.json({ slides })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")
  const slide = await heroSlideService.createHeroSlides(req.body as any)
  res.json({ slide })
}
