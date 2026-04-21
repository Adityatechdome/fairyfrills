import ContentPageView from "@/pages/content-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/terms")({
  head: () => {
    const title = "Terms & Conditions | Fairy Frills"
    const description = "Read the terms and conditions for shopping at Fairy Frills, including order policies, returns, and more."
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
        { rel: "canonical", href: "https://fairyfrills.in/in/terms" },
      ],
    }
  },
  component: () => <ContentPageView slug="terms" />,
})
