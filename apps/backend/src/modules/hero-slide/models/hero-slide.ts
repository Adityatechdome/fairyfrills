import { model } from "@medusajs/framework/utils"

const HeroSlide = model.define("hero_slide", {
  id: model.id().primaryKey(),
  background_image_url: model.text(),
  mobile_background_image_url: model.text().nullable(),
  badge_text: model.text().nullable(),
  heading: model.text().nullable(),
  highlight_text: model.text().nullable(),
  subheading: model.text().nullable(),
  primary_button_label: model.text().nullable(),
  primary_button_link: model.text().nullable(),
  secondary_button_label: model.text().nullable(),
  secondary_button_link: model.text().nullable(),
  stat_1_value: model.text().nullable(),
  stat_1_label: model.text().nullable(),
  stat_2_value: model.text().nullable(),
  stat_2_label: model.text().nullable(),
  stat_3_value: model.text().nullable(),
  stat_3_label: model.text().nullable(),
  text_position: model.enum([
    "top-left", "top-center", "top-right",
    "middle-left", "middle-center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right"
  ]).default("middle-left"),
  mobile_text_position: model.enum([
    "top-left", "top-center", "top-right",
    "middle-left", "middle-center", "middle-right",
    "bottom-left", "bottom-center", "bottom-right"
  ]).nullable(),
  heading_color: model.text().nullable(),
  highlight_color: model.text().nullable(),
  subheading_color: model.text().nullable(),
  badge_text_color: model.text().nullable(),
  primary_button_text_color: model.text().nullable(),
  secondary_button_text_color: model.text().nullable(),
  stats_text_color: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default HeroSlide
