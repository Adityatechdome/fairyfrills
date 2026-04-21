import AddressesPage from "@/pages/account/addresses"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/account/addresses")({
  head: () => ({
    meta: [
      { title: "My Addresses - Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AddressesPage,
})
