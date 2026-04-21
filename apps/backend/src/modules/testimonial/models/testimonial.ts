import { model } from "@medusajs/framework/utils"

const Testimonial = model.define("testimonial", {
  id: model.id().primaryKey(),
  customer_name: model.text(),
  review_text: model.text(),
  rating: model.number().default(5),
  product_id: model.text().nullable(),
  order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Testimonial
