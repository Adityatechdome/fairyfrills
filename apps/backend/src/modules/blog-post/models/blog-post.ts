import { model } from "@medusajs/framework/utils"

const BlogPost = model.define("blog_post", {
  id: model.id().primaryKey(),
  title: model.text(),
  slug: model.text().unique(),
  content: model.text().default(""),
  thumbnail_url: model.text().nullable(),
  excerpt: model.text().default(""),
  author: model.text().default(""),
  is_active: model.boolean().default(true),
  published_at: model.dateTime().nullable(),
  sort_order: model.number().default(0),
})

export default BlogPost
