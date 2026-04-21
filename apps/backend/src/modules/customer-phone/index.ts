import CustomerPhoneModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CUSTOMER_PHONE_MODULE = "customerPhone"

export default Module(CUSTOMER_PHONE_MODULE, {
  service: CustomerPhoneModuleService,
})
