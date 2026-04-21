import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerContentService = req.scope.resolve("footerContent")

  const footers = await footerContentService.listFooterContents(
    { is_active: true }
  )

  const footer = footers[0] || null

  return res.json({ footer })
}
