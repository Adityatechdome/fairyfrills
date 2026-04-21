import { createFileRoute } from "@tanstack/react-router"
import { getRegion } from "@/lib/data/regions"
import SearchResults from "@/pages/search-results"

type SearchRouteSearch = {
  q?: string
}

export const Route = createFileRoute("/$countryCode/search")({
  validateSearch: (search: Record<string, unknown>): SearchRouteSearch => ({
    q: (search.q as string) || undefined,
  }),
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    const region = await queryClient.ensureQueryData({
      queryKey: ["region", countryCode],
      queryFn: () => getRegion({ country_code: countryCode }),
    })

    return { countryCode, region }
  },
  head: () => ({
    meta: [
      { title: "Search | Fairy Frills" },
      { name: "description", content: "Search for products at Fairy Frills." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SearchResults,
})
