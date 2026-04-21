import BlogsPage from "@/pages/blogs"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/blogs/")({
  head: () => {
    const title = "Blog | Fairy Frills"
    const description = "Read the latest from Fairy Frills - kids fashion tips, styling guides, and more."
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: "https://fairyfrills.in/in/blogs" },
      ],
    }
  },
  component: () => {
    const { countryCode } = Route.useParams()
    return <BlogsPage countryCode={countryCode} />
  },
})
