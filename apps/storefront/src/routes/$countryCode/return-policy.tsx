import ContentPageView from "@/pages/content-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/return-policy")({
  head: () => {
    const title = "Return Policy | Fairy Frills"
    const description = "Read our return policy to understand how Fairy Frills handles returns and exchanges."
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
        { rel: "canonical", href: "https://fairyfrills.in/in/return-policy" },
      ],
    }
  },
  component: () => <ContentPageView slug="return-policy" />,
})
