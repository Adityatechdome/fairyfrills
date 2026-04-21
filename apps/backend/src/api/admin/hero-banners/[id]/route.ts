import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")
  const banner = await heroBannerService.retrieveHeroBanner(req.params.id)
  res.json({ banner })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")
  const banner = await heroBannerService.updateHeroBanners({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ banner })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const heroBannerService = req.scope.resolve("heroBanner")
  await heroBannerService.deleteHeroBanners(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
