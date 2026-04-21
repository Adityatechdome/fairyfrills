import { model } from "@medusajs/framework/utils"

const FooterContent = model.define("footer_content", {
  id: model.id().primaryKey(),
  brand_description: model.text().nullable(),
  instagram_url: model.text().nullable(),
  youtube_url: model.text().nullable(),
  facebook_url: model.text().nullable(),
  twitter_url: model.text().nullable(),
  pinterest_url: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),
  is_active: model.boolean().default(true),
})

export default FooterContent
