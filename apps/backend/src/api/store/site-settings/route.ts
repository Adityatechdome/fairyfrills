import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const siteSettingsService = req.scope.resolve("siteSettings") as any

  const [settings] = await siteSettingsService.listSiteSettings({}, { take: 1 })

  if (!settings) {
    return res.json({
      confetti_enabled: true,
      virtual_tryon_html: null,
      virtual_tryon_bg_image_url: null,
      auth_banner_image_url: null,
      top_sellers_subheading: "OUR BESTSELLERS",
      top_sellers_heading: "Top Sellers",
    })
  }

  return res.json({
    confetti_enabled: settings.confetti_enabled,
    virtual_tryon_html: settings.virtual_tryon_html ?? null,
    virtual_tryon_bg_image_url: settings.virtual_tryon_bg_image_url ?? null,
    auth_banner_image_url: settings.auth_banner_image_url ?? null,
    top_sellers_subheading: settings.top_sellers_subheading ?? "OUR BESTSELLERS",
    top_sellers_heading: settings.top_sellers_heading ?? "Top Sellers",
  })
}
