import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const promoPopupService = req.scope.resolve("promoPopup")
  const { id } = req.params
  const popup = await promoPopupService.updatePromoPopups({ id, ...(req.body as any) })
  res.json({ popup })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const promoPopupService = req.scope.resolve("promoPopup")
  const { id } = req.params
  await promoPopupService.deletePromoPopups(id)
  res.json({ success: true })
}
