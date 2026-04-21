import { model } from "@medusajs/framework/utils"

export enum BadgeType {
  NEW = "NEW",
  EXCLUSIVE = "EXCLUSIVE",
  TRENDING = "TRENDING",
  BESTSELLER = "BESTSELLER",
  VIRAL = "VIRAL",
  HOT = "HOT",
  LIMITED_EDITION = "LIMITED_EDITION",
  SOLD_OUT = "SOLD_OUT",
}

const TopSeller = model.define("top_seller", {
  id: model.id().primaryKey(),
  product_id: model.text().unique(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
  badge_type: model.enum(BadgeType).nullable(),
  badge_visible: model.boolean().default(true),
  compare_at_price: model.number().nullable(),
})

export default TopSeller
