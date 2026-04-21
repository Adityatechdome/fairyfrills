import { model } from "@medusajs/framework/utils"

const Announcement = model.define("announcement", {
  id: model.id().primaryKey(),
  message: model.text(),
  is_active: model.boolean().default(true),
  order: model.number().default(0),
})

export default Announcement
