import FaqModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const FAQ_MODULE = "faq"

export default Module(FAQ_MODULE, {
  service: FaqModuleService,
})
