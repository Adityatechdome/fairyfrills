import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const announcementService = req.scope.resolve("announcement")
  const announcements = await announcementService.listAnnouncements(
    {},
    { order: { order: "ASC" } }
  )
  res.json({ announcements })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const announcementService = req.scope.resolve("announcement")
  const announcement = await announcementService.createAnnouncements(req.body as any)
  res.json({ announcement })
}
