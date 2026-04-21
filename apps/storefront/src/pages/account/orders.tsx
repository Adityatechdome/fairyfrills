import { AccountLayout } from "@/components/account-layout"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation } from "@tanstack/react-router"

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatPrice = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800"
    case "canceled":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const OrdersPage = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const { data: orders, isLoading } = useQuery({
    queryKey: queryKeys.customer.orders(),
    queryFn: async () => {
      const response = await sdk.store.order.list({
        limit: 50,
        offset: 0,
        fields:
          "id,display_id,created_at,total,currency_code,status,fulfillment_status,payment_status",
      })
      return response.orders
    },
  })

  return (
    <AccountLayout>
      <h1 className="font-serif text-2xl font-bold text-[var(--color-text)] mb-6">
        My Orders
      </h1>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      )}

      {!isLoading && (!orders || orders.length === 0) && (
        <div className="text-center py-16 border border-[var(--color-border-light)]">
          <p className="text-[var(--color-text-light)] text-base mb-4">
            You haven't placed any orders yet.
          </p>
          <Link to="/$countryCode/store" params={{ countryCode }}>
            <Button variant="primary" size="fit">
              Start Shopping
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-[var(--color-border-light)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-medium text-[var(--color-text)]">
                    Order #{order.display_id}
                  </p>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 capitalize ${getStatusColor(
                      order.status || ""
                    )}`}
                  >
                    {order.status || "processing"}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-light)] mt-1">
                  {formatDate(order.created_at as string)}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-medium text-[var(--color-text)]">
                  {formatPrice(order.total, order.currency_code)}
                </p>
                <Link
                  to="/$countryCode/account/orders/$orderId"
                  params={{ countryCode, orderId: order.id }}
                >
                  <Button variant="secondary" size="fit">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountLayout>
  )
}

export default OrdersPage
