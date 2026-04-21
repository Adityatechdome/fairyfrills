import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")
  const banners = await heroBannerService.listHeroBanners(
    {},
    { order: { order: "ASC" } }
  )
  res.json({ banners })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")
  const banner = await heroBannerService.createHeroBanners(req.body as any)
  res.json({ banner })
}
