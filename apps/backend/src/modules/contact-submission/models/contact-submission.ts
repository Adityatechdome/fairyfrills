import { model } from "@medusajs/framework/utils"

const ContactSubmission = model.define("contact_submission", {
  id: model.id().primaryKey(),
  first_name: model.text(),
  last_name: model.text(),
  email: model.text(),
  phone: model.text().default(""),
  country: model.text().default(""),
  message: model.text(),
  status: model.enum(["new", "read", "replied"]).default("new"),
})

export default ContactSubmission
