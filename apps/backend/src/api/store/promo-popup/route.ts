import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const promoPopupService = req.scope.resolve("promoPopup")

  const popups = await promoPopupService.listPromoPopups({ is_active: true })

  if (!popups || popups.length === 0) {
    return res.json({ popup: null })
  }

  return res.json({ popup: popups[0] })
}
