import { AccountLayout } from "@/components/account-layout"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useParams } from "@tanstack/react-router"

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatPrice = (amount: number | null | undefined, currencyCode: string) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Delivered",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        icon: "✓",
      }
    case "canceled":
      return {
        label: "Cancelled",
        bg: "bg-red-50",
        text: "text-red-600",
        border: "border-red-200",
        dot: "bg-red-500",
        icon: "✕",
      }
    case "pending":
      return {
        label: "Pending",
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
        dot: "bg-amber-400",
        icon: "⏳",
      }
    default:
      return {
        label: "Processing",
        bg: "bg-[#FFF0F5]",
        text: "text-[#8B1A4A]",
        border: "border-[rgba(231,153,170,0.3)]",
        dot: "bg-[#E799AA]",
        icon: "✦",
      }
  }
}

const OrderProgressTracker = ({ status }: { status?: string }) => {
  const steps = [
    { label: "Placed", done: true },
    { label: "Confirmed", done: true },
    { label: "Processing", done: status === "completed" },
    { label: "Shipped", done: status === "completed" },
    { label: "Delivered", done: status === "completed" },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round(((doneCount - 1) / (steps.length - 1)) * 100)

  return (
    <div className="relative flex items-start justify-between pt-2">
      {/* Track line */}
      <div className="absolute left-0 right-0 top-5 h-1 bg-zinc-100 rounded-full z-0" />
      {/* Fill */}
      <div
        className="absolute left-0 top-5 h-1 rounded-full z-0 transition-all duration-1000"
        style={{
          width: `${progressPercent}%`,
          background: "linear-gradient(90deg, #E799AA, #C084FC)",
        }}
      />
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col items-center gap-2 z-10 relative">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
              step.done
                ? "border-transparent text-white shadow-sm"
                : "bg-white border-zinc-200 text-zinc-400"
            }`}
            style={step.done ? { background: "linear-gradient(135deg, #E799AA, #C084FC)" } : {}}
          >
            {step.done ? "✓" : String(i + 1)}
          </div>
          <span className={`text-xs font-medium text-center leading-tight ${step.done ? "text-[#8B1A4A]" : "text-zinc-400"}`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

const SectionCard = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div
    className="rounded-2xl overflow-hidden shadow-sm"
    style={{ border: "1px solid rgba(231,153,170,0.2)" }}
  >
    <div
      className="px-5 py-3.5 flex items-center gap-2"
      style={{ background: "linear-gradient(135deg, #FFF5F7, #F5F0FF)", borderBottom: "1px solid rgba(231,153,170,0.15)" }}
    >
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-semibold text-zinc-700">{title}</h2>
    </div>
    {children}
  </div>
)

const OrderDetailPage = () => {
  const { orderId } = useParams({ strict: false }) as { orderId: string }
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const { data: order, isLoading, error } = useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: async () => {
      const response = await sdk.store.order.retrieve(orderId, {
        fields: [
          "id",
          "display_id",
          "status",
          "fulfillment_status",
          "payment_status",
          "currency_code",
          "created_at",
          "email",
          "total",
          "subtotal",
          "shipping_total",
          "tax_total",
          "discount_total",
          "*items",
          "items.id",
          "items.title",
          "items.product_title",
          "items.variant_title",
          "items.thumbnail",
          "items.quantity",
          "items.unit_price",
          "items.total",
          "items.metadata",
          "*shipping_address",
          "*billing_address",
        ].join(","),
      })
      return response.order
    },
    enabled: !!orderId,
  })

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div
            className="w-12 h-12 rounded-full border-3 border-[#E799AA] border-t-transparent animate-spin"
            style={{ borderWidth: 3 }}
          />
          <p className="text-sm text-zinc-400">Loading your order...</p>
        </div>
      </AccountLayout>
    )
  }

  if (error || !order) {
    return (
      <AccountLayout>
        <div className="mb-4">
          <Link to="/$countryCode/account/orders" params={{ countryCode }}>
            <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-[#8B1A4A] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Orders
            </button>
          </Link>
        </div>
        <p className="text-zinc-400 text-sm">Order not found or could not be loaded.</p>
      </AccountLayout>
    )
  }

  const statusConfig = getStatusConfig(order.status || "")
  const shippingAddr = order.shipping_address

  return (
    <AccountLayout>
      <div className="max-w-2xl space-y-5">
        {/* Back link */}
        <Link to="/$countryCode/account/orders" params={{ countryCode }}>
          <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-[#8B1A4A] transition-colors mb-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Orders
          </button>
        </Link>

        {/* Header */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #FFF0F5, #F5F0FF)", border: "1px solid rgba(231,153,170,0.2)" }}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Order</p>
              <h1 className="font-serif text-2xl font-bold text-[#8B1A4A]">#{order.display_id}</h1>
              <p className="text-xs text-zinc-500 mt-1">{formatDate(order.created_at as string)}</p>
            </div>
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border capitalize ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Progress tracker */}
        <SectionCard title="Order Journey" icon="✦">
          <div className="px-6 py-5">
            <OrderProgressTracker status={order.status} />
          </div>
        </SectionCard>

        {/* Items */}
        <SectionCard title="Your Items" icon="🎁">
          <div className="divide-y divide-[rgba(231,153,170,0.1)]">
            {(order.items ?? []).map((item) => {
              const size = (item.metadata as Record<string, unknown>)?.size as string | undefined
              const momSize = (item.metadata as Record<string, unknown>)?.mom_size as string | undefined
              const itemTotal = (item as any).total ?? (item as any).unit_price * (item.quantity ?? 1)
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#FFF0F5]">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.product_title || item.title || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎀</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-800 text-sm leading-snug">
                      {item.product_title || item.title}
                    </p>
                    {item.variant_title && item.variant_title !== "Default Variant" && (
                      <p className="text-xs text-zinc-500 mt-0.5">{item.variant_title}</p>
                    )}
                    {size && (
                      <p className="text-xs text-[#8B1A4A] font-medium mt-0.5">Size: {size}</p>
                    )}
                    {momSize && (
                      <p className="text-xs text-[var(--color-primary)] font-semibold mt-0.5">Mom&apos;s Size: {momSize}</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-[#8B1A4A] shrink-0 text-sm">
                    {formatPrice(itemTotal, order.currency_code)}
                  </p>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Shipping Address */}
        {shippingAddr && (
          <SectionCard title="Delivering To" icon="📍">
            <div className="px-5 py-4 text-sm text-zinc-600 space-y-0.5">
              <p className="font-semibold text-zinc-800">
                {shippingAddr.first_name} {shippingAddr.last_name}
              </p>
              <p>{shippingAddr.address_1}</p>
              {shippingAddr.address_2 && <p>{shippingAddr.address_2}</p>}
              <p>
                {shippingAddr.city}
                {shippingAddr.province ? `, ${shippingAddr.province}` : ""}{" "}
                {shippingAddr.postal_code}
              </p>
              <p className="uppercase">{shippingAddr.country_code}</p>
              {shippingAddr.phone && (
                <p className="text-zinc-500 mt-1">+91 {shippingAddr.phone}</p>
              )}
            </div>
          </SectionCard>
        )}

        {/* Payment Summary */}
        <SectionCard title="Payment Summary" icon="💳">
          <div className="px-5 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency_code)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
            </div>
            {(order.discount_total ?? 0) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_total, order.currency_code)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax_total, order.currency_code)}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(231,153,170,0.4)] to-transparent" />
            <div className="flex justify-between font-bold text-base pt-0.5">
              <span className="text-zinc-800">Total</span>
              <span
                style={{
                  background: "linear-gradient(90deg, #8B1A4A, #C084FC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {formatPrice(order.total, order.currency_code)}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Share CTA */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{ background: "linear-gradient(135deg, #FFF0F5, #F5F0FF)", border: "1px solid rgba(192,132,252,0.2)" }}
        >
          <p className="text-sm font-semibold text-zinc-700 mb-1">Share the Joy! 🎀</p>
          <p className="text-xs text-zinc-400 mb-4">Tag us when your little one wears it</p>
          <div className="flex gap-3 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I just received my order from Fairy Frills! 🎀✨ #FairyFrills #KidsFashion`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#25D366" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>

        {/* Continue shopping */}
        <div className="flex justify-center pb-4">
          <Link
            to="/$countryCode"
            params={{ countryCode }}
            className="px-8 py-3 rounded-full text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md"
            style={{ background: "linear-gradient(135deg, #8B1A4A, #C084FC)" }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </AccountLayout>
  )
}

export default OrderDetailPage
