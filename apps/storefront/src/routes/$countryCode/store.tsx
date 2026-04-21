import { createFileRoute, notFound } from "@tanstack/react-router"
import { getRegion } from "@/lib/data/regions"
import Store from "@/pages/store"
import { listProducts } from "@/lib/data/products"
import { HttpTypes } from "@medusajs/types"

export const Route = createFileRoute("/$countryCode/store")({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: async ({ params, context }): Promise<any> => {
    const { countryCode } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    if (!region) {
      throw notFound()
    }

    const { products } = await queryClient.ensureQueryData({
      queryKey: ["products", { region_id: region.id }],
      queryFn: () => listProducts({
        query_params: {
          limit: 100, // Reduce limit for SSR performance
          order: "-created_at"
        },
        region_id: region.id,
      }),
    })

    return {
      countryCode,
      region: region as unknown as HttpTypes.StoreRegion,
      products: products as unknown as HttpTypes.StoreProduct[],
    }
  },
  head: () => {
    const title = "Shop All Products | Fairy Frills"
    const description = "Browse our complete collection of handcrafted baby girl dresses, mother daughter matching outfits, and seasonal wear at Fairy Frills."
    const ogImage = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg"

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    }
  },
  component: Store,
})