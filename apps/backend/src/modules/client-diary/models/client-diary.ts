import { model } from "@medusajs/framework/utils"

const ClientDiary = model.define("client_diary", {
  id: model.id().primaryKey(),
  image_url: model.text(),
  title: model.text().nullable(),
  caption: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default ClientDiary
