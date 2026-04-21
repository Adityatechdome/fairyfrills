import { Price } from "@/components/ui/price"
import { Thumbnail } from "@/components/ui/thumbnail"
import {
  useApplyPromoCode,
  useRemovePromoCode,
} from "@/lib/hooks/use-cart"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"

interface CheckoutSummaryProps {
  cart: HttpTypes.StoreCart;
}

const CheckoutSummary = ({ cart }: CheckoutSummaryProps) => {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const applyPromoCodeMutation = useApplyPromoCode()
  const removePromoCodeMutation = useRemovePromoCode()

  const handleApply = () => {
    applyPromoCodeMutation.mutate(
      { code: promoCode },
      {
        onSuccess: () => {
          setShowPromoInput(false)
          setPromoCode("")
        },
      }
    )
  }

  const handleRemove = (code: string) => {
    removePromoCodeMutation.mutate({ code })
  }

  const summaryContent = (
    <div className="space-y-4">
      {/* Line items */}
      <div className="space-y-3">
        {cart.items?.map((item) => {
          const itemThumbnail =
            item.thumbnail ||
            (item.variant as any)?.product?.thumbnail ||
            (item.variant as any)?.product?.images?.[0]?.url
          const sizeFromVariant = item.variant_title && item.variant_title !== "Default Variant" ? item.variant_title : undefined
          const sizeFromMetadata = (item.metadata as any)?.size as string | undefined
          const displaySize = sizeFromVariant ?? sizeFromMetadata

          return (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-zinc-100 bg-zinc-50">
                <Thumbnail
                  thumbnail={itemThumbnail}
                  alt={item.product_title || item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2">
                  {item.product_title}
                </p>
                <div className="text-xs text-zinc-500 mt-0.5 space-y-0.5">
                  {displaySize && <p>Size: {displaySize}</p>}
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="shrink-0 text-sm font-bold text-zinc-900">
                <Price price={item.total || 0} currencyCode={cart.currency_code} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100" />

      {/* Totals */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <Price price={cart.item_subtotal ?? cart.subtotal} currencyCode={cart.currency_code} className="text-zinc-700 font-medium" />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Shipping</span>
          {(cart.shipping_total ?? 0) > 0 ? (
            <Price price={cart.shipping_total} currencyCode={cart.currency_code} className="text-zinc-700 font-medium" />
          ) : (
            <span className="text-zinc-400 text-sm italic">Calculated at next step</span>
          )}
        </div>
        {(cart.discount_total ?? 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-zinc-500">Discount</span>
            <Price price={cart.discount_total} currencyCode={cart.currency_code} type="discount" className="text-green-600 font-medium" />
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Tax</span>
          <Price price={cart.tax_total} currencyCode={cart.currency_code} className="text-zinc-700 font-medium" />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-zinc-900 text-base">Total</span>
        <span className="text-lg font-bold text-[#E799AA]">
          <Price price={cart.total} currencyCode={cart.currency_code} />
        </span>
      </div>

      {/* Applied promos */}
      {cart.promotions && cart.promotions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {cart.promotions.map((promo) => (
            <span
              key={promo.code}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF5F7] border border-[#E799AA]/40 text-xs font-medium text-[#8B1A4A]"
            >
              {promo.code}
              <button
                onClick={() => handleRemove(promo.code || "")}
                className="hover:text-[#8B1A4A]/70 transition-colors"
              >
                <XMark className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Promo code */}
      <div className="pt-1">
        {!showPromoInput ? (
          <button
            onClick={() => setShowPromoInput(true)}
            className="text-sm text-[#8B1A4A] underline underline-offset-2 hover:text-[#E799AA] transition-colors"
          >
            Add promo code
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:border-[#E799AA] focus:ring-2 focus:ring-[#E799AA]/20 transition-all"
            />
            <button
              onClick={handleApply}
              disabled={!promoCode || applyPromoCodeMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#E799AA] text-white hover:bg-[#d987a0] disabled:opacity-50 transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => { setShowPromoInput(false); setPromoCode("") }}
              className="px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sticky panel */}
      <div className="hidden lg:block sticky top-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-serif text-xl font-semibold text-zinc-900 mb-5">
            Order Summary
          </h2>
          {summaryContent}
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="lg:hidden bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setSummaryOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="font-serif text-base font-semibold text-zinc-900">
            Order Summary
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#E799AA]">
              <Price price={cart.total} currencyCode={cart.currency_code} />
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`transition-transform duration-200 ${summaryOpen ? "rotate-180" : ""}`}
            >
              <path d="M4 6L8 10L12 6" stroke="#8B1A4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>
        {summaryOpen && (
          <div className="px-5 pb-5 border-t border-zinc-100 pt-4">
            {summaryContent}
          </div>
        )}
      </div>
    </>
  )
}

export default CheckoutSummary
