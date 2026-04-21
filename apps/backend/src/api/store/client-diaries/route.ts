import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const clientDiaryService = req.scope.resolve("clientDiary")

  const entries = await clientDiaryService.listClientDiaries(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  return res.json({ entries })
}
