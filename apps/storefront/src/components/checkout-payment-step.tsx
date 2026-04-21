import StripeCardContainer from "@/components/stripe-card-container"
import {
  useCartPaymentMethods,
  useInitiateCartPaymentSession,
} from "@/lib/hooks/use-checkout"
import { isStripe as isStripeFunc, getActivePaymentSession, isPaidWithGiftCard } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useState } from "react"

interface PaymentStepProps {
  cart: HttpTypes.StoreCart;
  onNext: () => void;
  onBack: () => void;
}

const RazorpayLogo = () => (
  <svg viewBox="0 0 80 24" width="60" height="18" fill="none">
    <path d="M10.8 2L4.8 22h5.4l2.4-8.4h3.6L18.6 22H24L18 2H10.8zm3 11.4L15.6 7.2h.012L17.4 13.4H13.8z" fill="#072654" />
    <text x="22" y="17" fill="#072654" fontSize="11" fontFamily="sans-serif" fontWeight="700">Razorpay</text>
  </svg>
)

const TrustBadges = () => (
  <div className="flex flex-wrap justify-center gap-4 mt-2">
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>🔒</span>
      <span>Secure Payment</span>
    </div>
    <div className="w-px h-4 bg-zinc-200" />
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>🛡️</span>
      <span>256-bit Encrypted</span>
    </div>
    <div className="w-px h-4 bg-zinc-200" />
    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
      <span>✅</span>
      <span>100% Safe Checkout</span>
    </div>
  </div>
)

const PaymentStep = ({ cart, onNext, onBack }: PaymentStepProps) => {
  const { data: availablePaymentMethods = [] } = useCartPaymentMethods({
    region_id: cart.region?.id,
  })
  const initiatePaymentSessionMutation = useInitiateCartPaymentSession()

  const activeSession = getActivePaymentSession(cart)

  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ""
  )

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const paidByGiftcard = isPaidWithGiftCard(cart)

  // Filter out manual payment provider — only show Razorpay / Stripe
  const filteredPaymentMethods = availablePaymentMethods.filter(
    (m) => m.id !== "pp_system_default"
  )

  const initiatePaymentSession = useCallback(
    async (method: string) => {
      initiatePaymentSessionMutation.mutateAsync(
        { provider_id: method },
        {
          onError: (error) => {
            setError(error instanceof Error ? error.message : "An error occurred")
          },
        }
      )
    },
    [initiatePaymentSessionMutation]
  )

  const handlePaymentMethodChange = useCallback(
    async (method: string) => {
      setError(null)
      setSelectedPaymentMethod(method)
      initiatePaymentSession(method)
    },
    [initiatePaymentSession]
  )

  useEffect(() => {
    if (!selectedPaymentMethod && filteredPaymentMethods?.length > 0) {
      const firstMethod = filteredPaymentMethods[0]
      if (firstMethod) {
        setSelectedPaymentMethod(firstMethod.id)
        handlePaymentMethodChange(firstMethod.id)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPaymentMethods.length])

  const handleSubmit = useCallback(async () => {
    if (!selectedPaymentMethod) return
    if (!activeSession) {
      await initiatePaymentSession(selectedPaymentMethod)
    }
    onNext()
  }, [selectedPaymentMethod, activeSession, onNext, initiatePaymentSession])

  const getMethodLabel = (id: string) => {
    if (id === "pp_razorpay_razorpay") return "Razorpay"
    if (id.startsWith("pp_stripe")) return "Credit / Debit Card"
    return id
  }

  return (
    <div className="flex flex-col gap-6">
      {!paidByGiftcard && filteredPaymentMethods.length > 0 && (
        <div className="flex flex-col gap-3">
          {filteredPaymentMethods.map((paymentMethod) => {
            const isSelected = selectedPaymentMethod === paymentMethod.id
            const isRazorpay = paymentMethod.id === "pp_razorpay_razorpay"

            return (
              <div key={paymentMethod.id}>
                <div
                  onClick={() => handlePaymentMethodChange(paymentMethod.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[#E799AA] bg-[#FFF5F7] shadow-sm"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Custom radio */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isSelected ? "border-[#E799AA]" : "border-zinc-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E799AA]" />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">
                      {getMethodLabel(paymentMethod.id)}
                    </span>
                  </div>
                  <div className="shrink-0">
                    {isRazorpay ? (
                      <RazorpayLogo />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="1.5" />
                        <path d="M2 9h20" stroke="#94a3b8" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Stripe card form */}
                {isStripeFunc(paymentMethod.id) && isSelected && (
                  <div className="mt-2 px-4">
                    <StripeCardContainer
                      paymentProviderId={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                      setError={setError}
                      onSelect={() => handlePaymentMethodChange(paymentMethod.id)}
                      onCardComplete={handleSubmit}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {filteredPaymentMethods.length === 0 && !paidByGiftcard && (
        <p className="text-sm text-zinc-500 py-4 text-center">
          No payment methods available for your region.
        </p>
      )}

      {paidByGiftcard && (
        <div className="p-4 rounded-2xl border-2 border-[#E799AA] bg-[#FFF5F7]">
          <p className="text-sm font-semibold text-zinc-900">Gift Card</p>
        </div>
      )}

      {/* Trust badges */}
      <TrustBadges />

      {error && (
        <p className="text-xs text-rose-500 text-center">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={initiatePaymentSessionMutation.isPending}
          className="flex-1 py-3.5 rounded-full border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            (isStripe && !activeSession) ||
            (!selectedPaymentMethod && !paidByGiftcard) ||
            initiatePaymentSessionMutation.isPending
          }
          className="flex-1 py-3.5 rounded-full bg-[#8B1A4A] text-white font-bold text-sm hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {!activeSession && isStripeFunc(selectedPaymentMethod)
            ? "Enter card details"
            : "Next"}
        </button>
      </div>
    </div>
  )
}

export default PaymentStep
