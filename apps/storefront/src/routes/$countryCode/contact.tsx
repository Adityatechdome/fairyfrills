import ContactPage from "@/pages/contact"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/contact")({
  head: () => {
    const title = "Contact Us | Fairy Frills"
    const description = "Get in touch with Fairy Frills. We're here to help with your orders, customizations, and any questions."
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
        { rel: "canonical", href: "https://fairyfrills.in/in/contact" },
      ],
    }
  },
  component: ContactPage,
})
