import FooterContentModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const FOOTER_CONTENT_MODULE = "footerContent"

export default Module(FOOTER_CONTENT_MODULE, {
  service: FooterContentModuleService,
})
