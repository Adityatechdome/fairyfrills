import ContentPageModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CONTENT_PAGE_MODULE = "contentPage"

export default Module(CONTENT_PAGE_MODULE, {
  service: ContentPageModuleService,
})
