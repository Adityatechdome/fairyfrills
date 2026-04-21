// Homepage route - entry point for the storefront
import Home from "@/pages/home"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { getRegion } from "@/lib/data/regions"

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fairy Frills",
  url: "https://fairyfrills.in",
  logo: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/ChatGPT-Image-Mar-16-2026-01_01_02-PM-1-01KKTRZ1RX02Z34GZ7S0HA1GT4.png",
  description: "Handcrafted baby girl dresses & mother-daughter matching outfits",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Fairy Frills",
  url: "https://fairyfrills.in",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://fairyfrills.in/in/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
}

export const Route = createFileRoute("/$countryCode/")({
  // Prefetch region data before rendering
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region) {
      throw notFound()
    }

    return {
      countryCode,
      region,
    }
  },
  head: () => {
    const title = "Fairy Frills - Handcrafted Baby Girl Dresses & Mother Daughter Outfits"
    const description = "Fairy Frills is a designer clothing brand creating handcrafted baby girl dresses and elegant mother daughter twinning outfits for life's most special moments."
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
        { rel: "canonical", href: "https://fairyfrills.in/in" },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(organizationSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(websiteSchema),
        },
      ],
    }
  },
  component: Home,
})
