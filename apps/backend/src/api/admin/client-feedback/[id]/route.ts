import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve("clientFeedback")
  const entry = await service.updateClientFeedbacks({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ entry })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve("clientFeedback")
  await service.deleteClientFeedbacks(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
