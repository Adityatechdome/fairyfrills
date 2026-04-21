import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  const [post] = await blogPostService.listBlogPosts(
    { slug: req.params.slug, is_active: true },
    { take: 1 }
  )

  if (!post) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Blog post not found")
  }

  res.json({ post })
}
