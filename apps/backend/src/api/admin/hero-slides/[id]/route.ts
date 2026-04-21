import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")
  const slide = await heroSlideService.retrieveHeroSlide(req.params.id)
  res.json({ slide })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")
  const slide = await heroSlideService.updateHeroSlides({ id: req.params.id, ...(req.body as Record<string, any>) })
  res.json({ slide })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroSlideService = req.scope.resolve("heroSlide")
  await heroSlideService.deleteHeroSlides(req.params.id)
  res.json({ success: true })
}
