import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const promoPopupService = req.scope.resolve("promoPopup")
  const popups = await promoPopupService.listPromoPopups({})
  res.json({ popups })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const promoPopupService = req.scope.resolve("promoPopup")
  const popup = await promoPopupService.createPromoPopups(req.body as any)
  res.json({ popup })
}
