import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve("clientFeedback")

  const entries = await service.listClientFeedbacks(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  return res.json({ entries })
}
