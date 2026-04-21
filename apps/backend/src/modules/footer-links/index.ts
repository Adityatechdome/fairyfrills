import FooterLinksModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const FOOTER_LINKS_MODULE = "footerLinks"

export default Module(FOOTER_LINKS_MODULE, {
  service: FooterLinksModuleService,
})
