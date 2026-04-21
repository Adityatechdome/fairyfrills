import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const BASE_URL = "https://fairyfrills.in"

const staticPages = [
  { url: `${BASE_URL}/in`, changefreq: "daily", priority: "1.0" },
  { url: `${BASE_URL}/in/about`, changefreq: "monthly", priority: "0.6" },
  { url: `${BASE_URL}/in/contact`, changefreq: "monthly", priority: "0.6" },
  { url: `${BASE_URL}/in/blogs`, changefreq: "weekly", priority: "0.7" },
  { url: `${BASE_URL}/in/faqs`, changefreq: "monthly", priority: "0.6" },
  { url: `${BASE_URL}/in/virtual-try-on`, changefreq: "monthly", priority: "0.7" },
  { url: `${BASE_URL}/in/terms`, changefreq: "yearly", priority: "0.3" },
  { url: `${BASE_URL}/in/privacy-policy`, changefreq: "yearly", priority: "0.3" },
  { url: `${BASE_URL}/in/shipping-policy`, changefreq: "yearly", priority: "0.4" },
  { url: `${BASE_URL}/in/return-policy`, changefreq: "yearly", priority: "0.4" },
]

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().split("T")[0]
  return new Date(date).toISOString().split("T")[0]
}

function buildUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const urlEntries: string[] = []

  // Static pages
  const today = formatDate(new Date())
  for (const page of staticPages) {
    urlEntries.push(buildUrl(page.url, today, page.changefreq, page.priority))
  }

  // Products
  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["handle", "updated_at", "status"],
      filters: { status: "published" },
      pagination: { take: 1000 },
    })

    for (const product of products ?? []) {
      if (!product.handle) continue
      urlEntries.push(buildUrl(
        `${BASE_URL}/in/products/${product.handle}`,
        formatDate(product.updated_at),
        "weekly",
        "0.8"
      ))
    }
  } catch {
    // Products unavailable — skip
  }

  // Categories
  try {
    const { data: categories } = await query.graph({
      entity: "product_category",
      fields: ["handle", "updated_at"],
      pagination: { take: 200 },
    })

    for (const category of categories ?? []) {
      if (!category.handle) continue
      urlEntries.push(buildUrl(
        `${BASE_URL}/in/categories/${category.handle}`,
        formatDate(category.updated_at),
        "weekly",
        "0.7"
      ))
    }
  } catch {
    // Categories unavailable — skip
  }

  // Blog posts
  try {
    const blogPostService = req.scope.resolve("blogPost")
    const posts = await blogPostService.listBlogPosts(
      { is_active: true },
      { select: ["slug", "published_at"], order: { published_at: "DESC" } }
    )

    for (const post of posts ?? []) {
      if (!post.slug) continue
      urlEntries.push(buildUrl(
        `${BASE_URL}/in/blogs/${post.slug}`,
        formatDate(post.published_at),
        "monthly",
        "0.6"
      ))
    }
  } catch {
    // Blog service unavailable — skip
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>`

  res.setHeader("Content-Type", "application/xml; charset=utf-8")
  res.setHeader("Cache-Control", "public, max-age=3600")
  res.send(xml)
}
