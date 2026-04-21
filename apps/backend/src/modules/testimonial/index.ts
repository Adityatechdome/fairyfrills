import TestimonialModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const TESTIMONIAL_MODULE = "testimonial"

export default Module(TESTIMONIAL_MODULE, {
  service: TestimonialModuleService,
})
