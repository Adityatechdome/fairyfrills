import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  const post = await blogPostService.updateBlogPosts({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ post })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  await blogPostService.deleteBlogPosts(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
