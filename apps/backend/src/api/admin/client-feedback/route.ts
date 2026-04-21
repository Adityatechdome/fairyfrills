import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve("clientFeedback")

  const entries = await service.listClientFeedbacks(
    {},
    { order: { sort_order: "ASC" } }
  )

  res.json({ entries })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve("clientFeedback")
  const entry = await service.createClientFeedbacks(req.body as any)
  res.json({ entry })
}
