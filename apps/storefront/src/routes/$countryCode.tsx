import { createFileRoute, notFound, Outlet } from "@tanstack/react-router"
import { listRegions } from "@/lib/data/regions"

export const Route = createFileRoute("/$countryCode")({
  loader: async ({ params, context }) => {
    const { countryCode } = params
    const { queryClient } = context

    try {
      const regions = await queryClient.ensureQueryData({
        queryKey: ["regions"],
        queryFn: () => listRegions({ fields: "currency_code, *countries" }),
      })

      const isValidCountry = regions.some(
        region => region.countries?.some(
          country => country.iso_2 === countryCode.toLowerCase()
        )
      )

      if (!isValidCountry) {
        throw notFound()
      }
    } catch (e: any) {
      if (e?.routerCode === "NOT_FOUND") throw e
      console.error("Failed to validate country code:", e)
    }

    return { countryCode }
  },
  component: () => <Outlet />,
})