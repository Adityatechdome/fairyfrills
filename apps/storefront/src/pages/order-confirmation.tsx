import { useLoaderData, Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useState } from "react"

const formatPrice = (amount: number | null | undefined, currencyCode: string) => {
  if (amount == null) return "—"
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Confetti particle
interface ConfettiParticle {
  id: number
  left: string
  color: string
  delay: string
  duration: string
  shape: "circle" | "square" | "star"
}

const CONFETTI_COLORS = [
  "#E799AA", "#f2c4cf", "#C084FC", "#FCD34D", "#34D399", "#60A5FA", "#F87171", "#FBBF24"
]

const StarIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
)

const SparkleIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
)

const ConfettiCanvas = () => {
  const [particles, setParticles] = useState<ConfettiParticle[]>([])

  useEffect(() => {
    const items: ConfettiParticle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: `${Math.random() * 1.5}s`,
      duration: `${2 + Math.random() * 1.5}s`,
      shape: (["circle", "square", "star"] as const)[Math.floor(Math.random() * 3)],
    }))
    setParticles(items)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: p.left,
            top: "-20px",
            color: p.color,
            animationName: "confetti-drop",
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationFillMode: "forwards",
            animationTimingFunction: "ease-in",
          }}
        >
          {p.shape === "star" ? (
            <StarIcon size={10} />
          ) : (
            <div
              style={{
                width: p.shape === "circle" ? 8 : 7,
                height: p.shape === "circle" ? 8 : 7,
                background: p.color,
                borderRadius: p.shape === "circle" ? "50%" : 1,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

const OrderProgressTracker = ({ status }: { status?: string }) => {
  const steps = [
    { label: "Placed", icon: "✓", done: true },
    { label: "Confirmed", icon: "✓", done: true },
    { label: "Processing", icon: "⚙", done: status === "completed" },
    { label: "Shipped", icon: "📦", done: status === "completed" },
    { label: "Delivered", icon: "🎀", done: status === "completed" },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round(((doneCount - 1) / (steps.length - 1)) * 100)

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Track line */}
        <div className="absolute left-0 right-0 top-4 h-1 bg-zinc-100 rounded-full z-0" />
        {/* Animated fill */}
        <div
          className="absolute left-0 top-4 h-1 rounded-full z-0"
          style={{
            width: `${progressPercent}%`,
            background: "linear-gradient(90deg, #E799AA, #C084FC, #FCD34D)",
            animationName: "progress-fill",
            animationDuration: "1s",
            animationDelay: "0.5s",
            animationFillMode: "forwards",
            animationTimingFunction: "ease",
          }}
        />
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 z-10 relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                step.done
                  ? "bg-gradient-to-br from-[#E799AA] to-[#C084FC] border-transparent text-white shadow-md"
                  : "bg-white border-zinc-200 text-zinc-400"
              }`}
            >
              {step.done ? "✓" : step.icon}
            </div>
            <span className={`text-xs font-medium whitespace-nowrap ${step.done ? "text-[#E799AA]" : "text-zinc-400"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface FairyOrderConfirmationProps {
  order: HttpTypes.StoreOrder
  countryCode: string
}

const FairyOrderConfirmation = ({ order, countryCode }: FairyOrderConfirmationProps) => {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(t)
  }, [])

  const shippingAddr = order.shipping_address

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF0F5] via-white to-[#F5F0FF] relative overflow-hidden">
      {showConfetti && <ConfettiCanvas />}

      {/* Floating background sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { top: "8%", left: "6%", delay: "0s", color: "#E799AA", size: 18 },
          { top: "15%", right: "8%", delay: "0.4s", color: "#C084FC", size: 14 },
          { top: "35%", left: "3%", delay: "0.8s", color: "#FCD34D", size: 12 },
          { top: "55%", right: "5%", delay: "1.2s", color: "#E799AA", size: 16 },
          { top: "70%", left: "8%", delay: "0.6s", color: "#C084FC", size: 10 },
          { top: "85%", right: "10%", delay: "1s", color: "#FCD34D", size: 14 },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: "left" in s ? s.left : undefined,
              right: "right" in s ? s.right : undefined,
              color: s.color,
              animationName: "float-star",
              animationDuration: "3s",
              animationDelay: s.delay,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              opacity: 0.5,
            }}
          >
            <StarIcon size={s.size} />
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">

        {/* Success badge */}
        <div
          className="flex flex-col items-center text-center mb-8"
          style={{ animation: "var(--animation-order-fade-up)" }}
        >
          {/* Animated check circle */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 relative"
            style={{
              background: "linear-gradient(135deg, #E799AA 0%, #C084FC 100%)",
              animation: "var(--animation-order-pop)",
              boxShadow: "0 8px 32px rgba(231, 153, 170, 0.4)",
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <path
                d="M10 22L18 30L34 14"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="100"
                style={{ animation: "var(--animation-check-draw)" }}
              />
            </svg>
            {/* Sparkle ring */}
            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5"
                style={{
                  color: ["#FCD34D", "#E799AA", "#C084FC"][i % 3],
                  transform: `rotate(${deg}deg) translateY(-42px)`,
                  animation: `var(--animation-sparkle-burst)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <StarIcon size={10} />
              </div>
            ))}
          </div>

          {/* Heading */}
          <div
            className="mb-1"
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#C084FC",
              animation: "var(--animation-order-fade-up-1)",
            }}
          >
            Your Gift is On Its Way
          </div>
          <h1
            className="font-serif text-4xl md:text-5xl font-bold mb-3"
            style={{
              background: "linear-gradient(135deg, #8B1A4A 0%, #C084FC 50%, #E799AA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "var(--animation-order-fade-up-2)",
            }}
          >
            Order Confirmed!
          </h1>
          <p
            className="text-[#7a6068] text-base max-w-sm"
            style={{ animation: "var(--animation-order-fade-up-3)" }}
          >
            Thank you for shopping with Fairy Frills. We&apos;re lovingly preparing your little one&apos;s special outfit.
          </p>
        </div>

        {/* Order ID card */}
        <div
          className="rounded-2xl p-5 mb-5 text-center"
          style={{
            background: "linear-gradient(135deg, #FFF5F7 0%, #F5F0FF 100%)",
            border: "1.5px solid rgba(231,153,170,0.3)",
            animation: "var(--animation-order-fade-up-1)",
          }}
        >
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">Order Number</p>
          <p className="font-serif text-2xl font-bold text-[#8B1A4A]">#{order.display_id}</p>
          <p className="text-sm text-zinc-500 mt-1">{formatDate(order.created_at as string)}</p>
        </div>

        {/* Progress Tracker */}
        <div
          className="bg-white rounded-2xl px-6 py-5 mb-5 shadow-sm"
          style={{
            border: "1px solid rgba(231,153,170,0.2)",
            animation: "var(--animation-order-fade-up-2)",
          }}
        >
          <h2 className="text-sm font-semibold text-zinc-700 mb-4 flex items-center gap-2">
            <SparkleIcon size={14} className="text-[#E799AA]" />
            Order Journey
          </h2>
          <OrderProgressTracker status={order.status} />
        </div>

        {/* Items */}
        <div
          className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm"
          style={{
            border: "1px solid rgba(231,153,170,0.2)",
            animation: "var(--animation-order-fade-up-3)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{
              background: "linear-gradient(135deg, #FFF0F5, #F5F0FF)",
              borderBottom: "1px solid rgba(231,153,170,0.15)",
            }}
          >
            <h2 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <span>🎁</span> Your Items
            </h2>
          </div>
          <div className="divide-y divide-[rgba(231,153,170,0.1)]">
            {(order.items ?? []).map((item) => {
              const itemTotal = (item as any).total ?? (item as any).unit_price * (item.quantity ?? 1)
              return (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#FFF0F5]">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.product_title || item.title || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎀</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-800 text-sm leading-snug">{item.product_title || item.title}</p>
                    {item.variant_title && item.variant_title !== "Default Variant" && (
                      <p className="text-xs text-zinc-500 mt-0.5">{item.variant_title}</p>
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
        </div>

        {/* Delivery address */}
        {shippingAddr && (
          <div
            className="bg-white rounded-2xl overflow-hidden mb-5 shadow-sm"
            style={{
              border: "1px solid rgba(231,153,170,0.2)",
              animation: "var(--animation-order-fade-up-4)",
            }}
          >
            <div
              className="px-6 py-4"
              style={{
                background: "linear-gradient(135deg, #FFF0F5, #F5F0FF)",
                borderBottom: "1px solid rgba(231,153,170,0.15)",
              }}
            >
              <h2 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                <span>📍</span> Delivering To
              </h2>
            </div>
            <div className="px-6 py-4 text-sm text-zinc-600 space-y-0.5">
              <p className="font-semibold text-zinc-800">{shippingAddr.first_name} {shippingAddr.last_name}</p>
              <p>{shippingAddr.address_1}</p>
              {shippingAddr.address_2 && <p>{shippingAddr.address_2}</p>}
              <p>{shippingAddr.city}{shippingAddr.province ? `, ${shippingAddr.province}` : ""} {shippingAddr.postal_code}</p>
              <p className="uppercase">{shippingAddr.country_code}</p>
              {shippingAddr.phone && <p className="text-zinc-500">+91 {shippingAddr.phone}</p>}
            </div>
          </div>
        )}

        {/* Order summary */}
        <div
          className="bg-white rounded-2xl overflow-hidden mb-6 shadow-sm"
          style={{
            border: "1px solid rgba(231,153,170,0.2)",
            animation: "var(--animation-order-fade-up-5)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{
              background: "linear-gradient(135deg, #FFF0F5, #F5F0FF)",
              borderBottom: "1px solid rgba(231,153,170,0.15)",
            }}
          >
            <h2 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <span>💫</span> Payment Summary
            </h2>
          </div>
          <div className="px-6 py-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal, order.currency_code)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_total, order.currency_code)}</span>
            </div>
            {(order.discount_total ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(order.discount_total, order.currency_code)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax_total, order.currency_code)}</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[rgba(231,153,170,0.3)] to-transparent my-1" />
            <div className="flex justify-between font-bold text-base">
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
        </div>

        {/* Share the joy */}
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            background: "linear-gradient(135deg, #FFF0F5 0%, #F5F0FF 100%)",
            border: "1.5px solid rgba(192,132,252,0.2)",
            animation: "var(--animation-order-fade-up-5)",
          }}
        >
          <p className="text-sm font-semibold text-zinc-700 mb-1">Share the Joy!</p>
          <p className="text-xs text-zinc-400 mb-4">Tag us when your little one wears it</p>
          <div className="flex gap-3 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`I just ordered from Fairy Frills! 🎀✨ Can't wait for it to arrive! #FairyFrills #KidsFashion`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{ background: "#25D366" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3" style={{ animation: "var(--animation-order-fade-up-5)" }}>
          <Link
            to="/$countryCode/account/orders/$orderId"
            params={{ countryCode, orderId: order.id }}
            className="flex-1 py-3.5 rounded-full text-center text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-md"
            style={{
              background: "linear-gradient(135deg, #8B1A4A, #C084FC)",
            }}
          >
            View Order Details
          </Link>
          <Link
            to="/$countryCode"
            params={{ countryCode }}
            className="flex-1 py-3.5 rounded-full text-center text-sm font-semibold border-2 border-[#E799AA] text-[#8B1A4A] transition-all duration-200 hover:bg-[#FFF0F5] hover:scale-[1.02] active:scale-95"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-400 mt-6">
          A confirmation email has been sent to {order.email ?? "your email"} ✨
        </p>
      </div>
    </div>
  )
}

const OrderConfirmation = () => {
  const { order } = useLoaderData({
    from: "/$countryCode/order/$orderId/confirmed",
  })
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  if (!order) {
    return (
      <div className="content-container py-16 text-center">
        <h1 className="text-xl mb-4 font-serif">Order Not Found</h1>
        <p className="text-zinc-500">The order could not be found.</p>
      </div>
    )
  }

  return <FairyOrderConfirmation order={order} countryCode={countryCode} />
}

export default OrderConfirmation
