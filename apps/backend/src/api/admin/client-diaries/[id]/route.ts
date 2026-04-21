import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientDiaryService = req.scope.resolve("clientDiary")
  const entry = await clientDiaryService.updateClientDiaries({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ entry })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientDiaryService = req.scope.resolve("clientDiary")
  await clientDiaryService.deleteClientDiaries(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
