import BlogPostPage from "@/pages/blog-post"
import { sdk } from "@/lib/utils/sdk"
import { generateArticleSchema } from "@/lib/utils/structured-data"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/blogs/$slug")({
  loader: async ({ params }) => {
    const { slug } = params

    try {
      const data = await sdk.client.fetch<{
        post: {
          title: string
          content: string
          author: string
          published_at: string | null
          thumbnail_url: string | null
          excerpt?: string
        }
      }>(`/store/blogs/${slug}`)
      return data ?? null
    } catch {
      return null
    }
  },
  head: ({ loaderData, params }) => {
    const post = (loaderData as any)?.post
    const { slug } = params as { slug: string }

    if (!post) {
      return {
        meta: [{ title: "Blog | Fairy Frills" }],
      }
    }

    const title = `${post.title} | Fairy Frills`
    const description = post.excerpt || `Read ${post.title} on the Fairy Frills blog.`
    const ogImage =
      post.thumbnail_url ||
      "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg"
    const canonicalUrl = `https://fairyfrills.in/in/blogs/${slug}`

    const articleSchema = generateArticleSchema({
      title: post.title,
      description,
      url: canonicalUrl,
      image: post.thumbnail_url || undefined,
      datePublished: post.published_at || undefined,
      dateModified: post.published_at || undefined,
    })

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(articleSchema),
        },
      ],
    }
  },
  component: () => {
    const { slug, countryCode } = Route.useParams()
    return <BlogPostPage slug={slug} countryCode={countryCode} />
  },
})
