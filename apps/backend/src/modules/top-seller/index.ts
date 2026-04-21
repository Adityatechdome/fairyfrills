import TopSellerModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TOP_SELLER_MODULE = "topSeller"

export default Module(TOP_SELLER_MODULE, {
  service: TopSellerModuleService,
})
