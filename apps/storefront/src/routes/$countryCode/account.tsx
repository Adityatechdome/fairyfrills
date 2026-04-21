import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { sdk } from "@/lib/utils/sdk"

export const Route = createFileRoute("/$countryCode/account")({
  beforeLoad: async ({ params, location }) => {
    if (location.pathname.includes("/account/login")) return

    try {
      await sdk.store.customer.retrieve()
    } catch {
      throw redirect({
        to: "/$countryCode/account/login",
        params: { countryCode: params.countryCode },
        search: { redirect: location.pathname },
      })
    }
  },
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Outlet />,
})
