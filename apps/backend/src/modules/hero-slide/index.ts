import { Module } from "@medusajs/framework/utils"
import HeroSlideService from "./service"

export const HERO_SLIDE_MODULE = "heroSlide"

export default Module(HERO_SLIDE_MODULE, {
  service: HeroSlideService,
})
