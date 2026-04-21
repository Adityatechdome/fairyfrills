import { model } from "@medusajs/framework/utils"

const SiteSettings = model.define("site_settings", {
  id: model.id().primaryKey(),
  confetti_enabled: model.boolean().default(true),
  virtual_tryon_html: model.text().nullable(),
  virtual_tryon_bg_image_url: model.text().nullable(),
  ghl_welcome_webhook_url: model.text().nullable(),
  ghl_order_webhook_url: model.text().nullable(),
  auth_banner_image_url: model.text().nullable(),
  top_sellers_subheading: model.text().default("OUR BESTSELLERS"),
  top_sellers_heading: model.text().default("Top Sellers"),
})

export default SiteSettings
