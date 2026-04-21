import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")

  const banners = await heroBannerService.listHeroBanners(
    { is_active: true },
    { order: { order: "ASC" } }
  )

  return res.json({ banners })
}
