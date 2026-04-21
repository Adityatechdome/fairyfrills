import OrdersPage from "@/pages/account/orders"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/account/orders")({
  head: () => ({
    meta: [
      { title: "My Orders - Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrdersPage,
})
