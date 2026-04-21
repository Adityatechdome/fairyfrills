import MarqueeModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const MARQUEE_MODULE = "marquee"

export default Module(MARQUEE_MODULE, {
  service: MarqueeModuleService,
})
