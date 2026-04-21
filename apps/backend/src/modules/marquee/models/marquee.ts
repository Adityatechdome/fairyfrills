import { model } from "@medusajs/framework/utils"

const Marquee = model.define("marquee", {
  id: model.id().primaryKey(),
  text_items: model.json().default({} as Record<string, unknown>),
  is_active: model.boolean().default(true),
})

export default Marquee
