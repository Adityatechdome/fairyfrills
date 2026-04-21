import { createFileRoute, notFound } from "@tanstack/react-router"
import { retrieveCategory } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import Category from "@/pages/category"
import { HttpTypes } from "@medusajs/types"
import { generateBreadcrumbSchema } from "@/lib/utils/structured-data"

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  "birthday-outfits": {
    title: "Birthday Outfits & Princess Dresses for Girls | Fairy Frills",
    description: "Explore handcrafted birthday outfits and princess dresses for baby girls. Designer party wear, tutu dresses, and festive outfits that make every birthday magical.",
  },
  "mother-daughter-combos": {
    title: "Mother Daughter Matching Dresses & Combos | Fairy Frills",
    description: "Shop elegant mother daughter matching dresses and twinning outfits. Handcrafted coordinated sets for special occasions, festivals, and photoshoots.",
  },
  "seasonal": {
    title: "Summer Dresses & Seasonal Collection for Girls | Fairy Frills",
    description: "Browse our seasonal collection of light, breezy summer dresses for baby girls. Fresh styles, comfortable fabrics, and beautiful designs for every season.",
  },
}

export const Route = createFileRoute("/$countryCode/categories/$handle")({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: async ({ params, context }): Promise<any> => {
    const { countryCode, handle } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region || !handle) {
      throw notFound()
    }

    const category = await queryClient.ensureQueryData({
      queryKey: ["category", handle],
      queryFn: async () => {
        try {
          return await retrieveCategory({ handle })
        } catch {
          throw notFound()
        }
      },
    })

    return {
      countryCode,
      region: region as unknown as HttpTypes.StoreRegion,
      category: category as unknown as HttpTypes.StoreProductCategory,
    }
  },
  head: ({ loaderData }) => {
    const { category } = loaderData || {}
    const handle = category?.handle || ""
    const categoryName = category?.name || "Category"

    const seo = CATEGORY_SEO[handle]
    const title = seo?.title || `${categoryName} | Fairy Frills`
    const description = seo?.description || `Shop our ${categoryName.toLowerCase()} collection at Fairy Frills. Handcrafted designer outfits for baby girls and mothers.`
    const ogImage = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg"

    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: "Home", url: "https://fairyfrills.in/in" },
      { name: categoryName, url: `https://fairyfrills.in/in/categories/${handle}` },
    ])

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
        { rel: "canonical", href: `https://fairyfrills.in/in/categories/${handle}` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    }
  },
  component: Category,
})
