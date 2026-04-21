import { model } from "@medusajs/framework/utils"

const HeroBanner = model.define("hero_banner", {
  id: model.id().primaryKey(),
  // Legacy full-bleed image (kept for backward compat)
  image_url: model.text().nullable(),
  mobile_image_url: model.text().nullable(),
  order: model.number().default(0),
  is_active: model.boolean().default(true),
  // New collage hero fields
  heading: model.text().nullable(),
  highlight_text: model.text().nullable(),
  subheading: model.text().nullable(),
  badge_text: model.text().nullable(),
  shop_now_label: model.text().nullable(),
  shop_now_link: model.text().nullable(),
  virtual_tryon_label: model.text().nullable(),
  virtual_tryon_link: model.text().nullable(),
  stat_1_value: model.text().nullable(),
  stat_1_label: model.text().nullable(),
  stat_2_value: model.text().nullable(),
  stat_2_label: model.text().nullable(),
  stat_3_value: model.text().nullable(),
  stat_3_label: model.text().nullable(),
  collage_image_1: model.text().nullable(),
  collage_image_2: model.text().nullable(),
  collage_image_3: model.text().nullable(),
})

export default HeroBanner
