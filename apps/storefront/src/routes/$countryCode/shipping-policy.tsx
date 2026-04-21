import ContentPageView from "@/pages/content-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/shipping-policy")({
  head: () => {
    const title = "Shipping Policy | Fairy Frills"
    const description = "Learn about Fairy Frills shipping options, delivery times, and shipping charges across India."
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
        { rel: "canonical", href: "https://fairyfrills.in/in/shipping-policy" },
      ],
    }
  },
  component: () => <ContentPageView slug="shipping-policy" />,
})
