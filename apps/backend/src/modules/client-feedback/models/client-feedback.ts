import { model } from "@medusajs/framework/utils"

const ClientFeedback = model.define("client_feedback", {
  id: model.id().primaryKey(),
  image_url: model.text(),
  customer_name: model.text(),
  city: model.text().nullable(),
  platform: model.enum(["whatsapp", "instagram"]),
  rating: model.number().default(5),
  caption: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default ClientFeedback
