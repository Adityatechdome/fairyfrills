import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const topSellerService = req.scope.resolve("topSeller") as any
  const { id } = req.params
  const data = req.body as any

  const updated = await topSellerService.updateTopSellers({
    id,
    ...data,
  })

  res.json({ top_seller: updated })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const topSellerService = req.scope.resolve("topSeller") as any
  const { id } = req.params

  await topSellerService.deleteTopSellers(id)

  res.json({ success: true })
}
