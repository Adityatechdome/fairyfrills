import ContentPageView from "@/pages/content-page"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/privacy-policy")({
  head: () => {
    const title = "Privacy Policy | Fairy Frills"
    const description = "Read our privacy policy to understand how Fairy Frills collects, uses, and protects your personal information."
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
        { rel: "canonical", href: "https://fairyfrills.in/in/privacy-policy" },
      ],
    }
  },
  component: () => <ContentPageView slug="privacy-policy" />,
})
