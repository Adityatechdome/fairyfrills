import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const announcementService = req.scope.resolve("announcement")

  const announcements = await announcementService.listAnnouncements(
    { is_active: true },
    { order: { order: "ASC" } }
  )

  return res.json({ announcements })
}
