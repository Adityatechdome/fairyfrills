import { model } from "@medusajs/framework/utils"

const PromoPopup = model.define("promo_popup", {
  id: model.id().primaryKey(),
  is_active: model.boolean().default(false),
  banner_image_url: model.text().nullable(),
  top_label: model.text().nullable(),
  main_heading: model.text().nullable(),
  sub_text: model.text().nullable(),
  button_text: model.text().nullable(),
  button_link: model.text().nullable(),
  footer_note: model.text().nullable(),
  show_dont_show_again: model.boolean().default(true),
  delay_seconds: model.number().default(1),
  cooldown_hours: model.number().default(48),
})

export default PromoPopup
