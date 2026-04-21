import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerContentService = req.scope.resolve("footerContent")
  const footers = await footerContentService.listFooterContents()
  res.json({ footer: footers[0] || null })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerContentService = req.scope.resolve("footerContent")
  const footers = await footerContentService.listFooterContents()
  let footer
  if (footers.length > 0) {
    footer = await footerContentService.updateFooterContents({
      id: footers[0].id,
      ...(req.body as any),
    })
  } else {
    footer = await footerContentService.createFooterContents(req.body as any)
  }
  res.json({ footer })
}
