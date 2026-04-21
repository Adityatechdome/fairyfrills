import { model } from "@medusajs/framework/utils"

const Faq = model.define("faq", {
  id: model.id().primaryKey(),
  question: model.text(),
  answer: model.text(),
  category: model.text().default("General"),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Faq
