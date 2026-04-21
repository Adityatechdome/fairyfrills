import VtoModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const VTO_MODULE = "vto"

export default Module(VTO_MODULE, {
  service: VtoModuleService,
})
