import { defineLink } from "@medusajs/framework/utils"
import CustomerModule from "@medusajs/medusa/customer"
import CustomerPhoneModule from "../modules/customer-phone"

export default defineLink(
  CustomerModule.linkable.customer,
  {
    linkable: CustomerPhoneModule.linkable.customerPhone,
    deleteCascade: true,
  }
)
