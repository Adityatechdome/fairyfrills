import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const announcementService = req.scope.resolve("announcement")
  const announcement = await announcementService.updateAnnouncements({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ announcement })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const announcementService = req.scope.resolve("announcement")
  await announcementService.deleteAnnouncements(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
