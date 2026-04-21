import BlogPostModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const BLOG_POST_MODULE = "blogPost"

export default Module(BLOG_POST_MODULE, {
  service: BlogPostModuleService,
})
