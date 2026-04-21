import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")
  const link = await footerLinksService.retrieveFooterLink(req.params.id)
  return res.json({ link })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")
  const link = await footerLinksService.updateFooterLinks({
    id: req.params.id,
    ...(req.body as any),
  })
  return res.json({ link })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")
  await footerLinksService.deleteFooterLinks(req.params.id)
  return res.json({ id: req.params.id, deleted: true })
}
