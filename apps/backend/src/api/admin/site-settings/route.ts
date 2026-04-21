import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const siteSettingsService = req.scope.resolve("siteSettings") as any

  const [settings] = await siteSettingsService.listSiteSettings({}, { take: 1 })

  if (!settings) {
    return res.json({ settings: { confetti_enabled: true } })
  }

  return res.json({ settings })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const siteSettingsService = req.scope.resolve("siteSettings") as any
  const body = req.body as any

  const [existing] = await siteSettingsService.listSiteSettings({}, { take: 1 })

  let settings
  if (existing) {
    settings = await siteSettingsService.updateSiteSettings({
      id: existing.id,
      ...body,
    })
  } else {
    settings = await siteSettingsService.createSiteSettings({
      ...body,
    })
  }

  return res.json({ settings })
}
