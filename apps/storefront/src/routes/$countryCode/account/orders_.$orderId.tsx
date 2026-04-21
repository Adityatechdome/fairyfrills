import OrderDetailPage from "@/pages/account/order-detail"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/$countryCode/account/orders_/$orderId"
)({
  head: () => ({
    meta: [{ title: "Order Details - Fairy Frills" }],
  }),
  component: OrderDetailPage,
})
