import { MedusaService } from "@medusajs/framework/utils"
import BlogPost from "./models/blog-post"

class BlogPostModuleService extends MedusaService({
  BlogPost,
}) {}

export default BlogPostModuleService
