import { model } from "@medusajs/framework/utils"

const CustomerPhone = model.define("customer_phone", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  phone_number: model.text().nullable(),
  phone_verified: model.boolean().default(false),
})

export default CustomerPhone
