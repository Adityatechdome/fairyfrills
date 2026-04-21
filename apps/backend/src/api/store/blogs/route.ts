import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const blogPostService = req.scope.resolve("blogPost")
  const posts = await blogPostService.listBlogPosts(
    { is_active: true },
    {
      select: ["id", "title", "slug", "thumbnail_url", "excerpt", "author", "published_at", "sort_order"],
      order: { sort_order: "ASC", published_at: "DESC" },
    }
  )
  res.json({ posts })
}
