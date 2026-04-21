import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  const posts = await blogPostService.listBlogPosts(
    {},
    { order: { sort_order: "ASC", published_at: "DESC" } }
  )
  res.json({ posts })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  const post = await blogPostService.createBlogPosts(req.body as any)
  res.json({ post })
}
