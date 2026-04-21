import { createFileRoute } from "@tanstack/react-router"
import VirtualTryOnPage from "@/pages/virtual-try-on"

export const Route = createFileRoute("/$countryCode/virtual-try-on")({
  head: () => {
    const title = "Virtual Try-On — See How Our Dresses Look | Fairy Frills"
    const description = "Try Fairy Frills baby girl dresses virtually. Upload a photo and see how our handcrafted outfits look on your little one before buying."
    const ogImage = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg"

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "640" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: [
        { rel: "canonical", href: "https://fairyfrills.in/in/virtual-try-on" },
      ],
    }
  },
  component: VirtualTryOnPage,
})
