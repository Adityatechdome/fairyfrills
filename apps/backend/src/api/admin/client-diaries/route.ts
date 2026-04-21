import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientDiaryService = req.scope.resolve("clientDiary")

  const entries = await clientDiaryService.listClientDiaries(
    {},
    { order: { sort_order: "ASC" } }
  )

  res.json({ entries })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientDiaryService = req.scope.resolve("clientDiary")
  const entry = await clientDiaryService.createClientDiaries(req.body as any)
  res.json({ entry })
}
