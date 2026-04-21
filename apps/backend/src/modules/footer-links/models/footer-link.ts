import { model } from "@medusajs/framework/utils"

const FooterLink = model.define("footer_link", {
  id: model.id().primaryKey(),
  label: model.text(),
  url: model.text(),
  column: model.enum(["company_info", "company_policies"]),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default FooterLink
