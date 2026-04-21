import { model } from "@medusajs/framework/utils"

const ContentPage = model.define("content_page", {
  id: model.id().primaryKey(),
  slug: model.text().unique(),
  title: model.text(),
  content: model.text().default(""),
  is_active: model.boolean().default(true),
})

export default ContentPage
