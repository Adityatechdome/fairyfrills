import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")

  const links = await footerLinksService.listFooterLinks(
    {},
    { order: { sort_order: "ASC" } }
  )

  return res.json({ links })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")
  const link = await footerLinksService.createFooterLinks(req.body as any)
  return res.json({ link })
}
