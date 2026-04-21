import PaymentButton from "@/components/payment-button"
import StripeCardContainer from "@/components/stripe-card-container"
import { Price } from "@/components/ui/price"
import { Loading } from "@/components/ui/loading"
import {
  getActivePaymentSession,
  isPaidWithGiftCard,
  isStripe as isStripeFunc,
  calculatePriceForShippingOption,
} from "@/lib/utils/checkout"
import {
  useShippingOptions,
  useSetCartShippingMethod,
  useCartPaymentMethods,
  useInitiateCartPaymentSession,
} from "@/lib/hooks/use-checkout"
import { CheckoutStepKey } from "@/lib/types/global"
import { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useRef, useState } from "react"

interface ReviewStepProps {
  cart: HttpTypes.StoreCart;
  onBack: () => void;
  goToStep: (step: CheckoutStepKey) => void;
}

// ─── Address block ────────────────────────────────────────────────────────────

const AddressBlock = ({ address }: { address: HttpTypes.StoreCartAddress }) => (
  <p className="text-sm text-zinc-700 leading-relaxed">
    {address.first_name} {address.last_name}<br />
    {address.address_1}
    {address.address_2 && `, ${address.address_2}`}<br />
    {address.city}
    {address.province && `, ${address.province}`}
    {address.postal_code && ` — ${address.postal_code}`}<br />
    {address.country_code?.toUpperCase()}
    {address.phone && <><br />{address.phone}</>}
  </p>
)

// ─── Razorpay badge ───────────────────────────────────────────────────────────

const RazorpayBadge = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
  const w = size === "lg" ? 80 : 56
  const h = size === "lg" ? 24 : 17
  return (
    <svg viewBox="0 0 80 24" width={w} height={h} fill="none">
      <path d="M10.8 2L4.8 22h5.4l2.4-8.4h3.6L18.6 22H24L18 2H10.8zm3 11.4L15.6 7.2h.012L17.4 13.4H13.8z" fill="#072654" />
      <text x="22" y="17" fill="#072654" fontSize="11" fontFamily="sans-serif" fontWeight="700">Razorpay</text>
    </svg>
  )
}

// ─── Section card (collapsible) ───────────────────────────────────────────────

const SectionCard = ({
  title,
  onEdit,
  isEditing,
  children,
  editContent,
}: {
  title: string;
  onEdit: () => void;
  isEditing: boolean;
  children: React.ReactNode;
  editContent?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 overflow-hidden">
    <div className="flex items-center justify-between px-4 pt-4 pb-2">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</h4>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="text-xs font-semibold text-[#8B1A4A] hover:text-[#E799AA] transition-colors underline underline-offset-2"
        >
          Edit
        </button>
      )}
    </div>
    {!isEditing && <div className="px-4 pb-4">{children}</div>}
    {isEditing && editContent && (
      <div className="px-4 pb-4 border-t border-zinc-200 pt-4">{editContent}</div>
    )}
  </div>
)

// ─── Inline shipping editor ───────────────────────────────────────────────────

const InlineShippingEditor = ({
  cart,
  onDone,
}: {
  cart: HttpTypes.StoreCart;
  onDone: () => void;
}) => {
  const { data: shippingOptions } = useShippingOptions({ cart_id: cart.id })
  const setShippingMutation = useSetCartShippingMethod()
  const [selectedId, setSelectedId] = useState(
    cart.shipping_methods?.[0]?.shipping_option_id || ""
  )
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedId || saving) return
    setSaving(true)
    await setShippingMutation.mutateAsync(
      { shipping_option_id: selectedId },
      { onSettled: () => setSaving(false) }
    )
    onDone()
  }

  return (
    <div className="flex flex-col gap-3">
      {shippingOptions?.map((option) => (
        <ShippingOptionRow
          key={option.id}
          option={option}
          cart={cart}
          isSelected={selectedId === option.id}
          onSelect={setSelectedId}
        />
      ))}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onDone}
          className="flex-1 py-2.5 rounded-full border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!selectedId || saving}
          className="flex-1 py-2.5 rounded-full bg-[#8B1A4A] text-white font-bold text-sm hover:bg-[#7a1640] disabled:opacity-50 transition-all shadow-md"
        >
          {saving ? "Saving..." : "Done"}
        </button>
      </div>
    </div>
  )
}

const ShippingOptionRow = ({
  option,
  cart,
  isSelected,
  onSelect,
}: {
  option: HttpTypes.StoreCartShippingOption;
  cart: HttpTypes.StoreCart;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(undefined)
  const isMounted = useRef(true)
  const price = option.price_type === "calculated" ? calculatedPrice : option.amount

  useEffect(() => {
    isMounted.current = true
    if (option.price_type !== "calculated") return
    calculatePriceForShippingOption({ option_id: option.id })
      .then((opt) => { if (isMounted.current) setCalculatedPrice(opt.amount) })
      .catch(() => {})
    return () => { isMounted.current = false }
  }, [option.price_type, option.id])

  return (
    <div
      onClick={() => onSelect(option.id)}
      className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected ? "border-[#E799AA] bg-[#FFF5F7]" : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#E799AA]" : "border-zinc-300"}`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-[#E799AA]" />}
        </div>
        <p className="text-sm font-semibold text-zinc-900">{option.name}</p>
      </div>
      {price !== undefined ? (
        <Price price={price} currencyCode={cart.currency_code} textWeight="plus" className="text-sm" />
      ) : (
        <Loading className="w-4 h-4" rows={1} />
      )}
    </div>
  )
}

// ─── Inline payment editor ────────────────────────────────────────────────────

const InlinePaymentEditor = ({
  cart,
  onDone,
}: {
  cart: HttpTypes.StoreCart;
  onDone: () => void;
}) => {
  const { data: availablePaymentMethods = [] } = useCartPaymentMethods({
    region_id: cart.region?.id,
  })
  const initiatePaymentSessionMutation = useInitiateCartPaymentSession()
  const activeSession = getActivePaymentSession(cart)
  const [selected, setSelected] = useState(activeSession?.provider_id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = availablePaymentMethods.filter((m) => m.id !== "pp_system_default")

  const handleChange = useCallback(
    async (method: string) => {
      setError(null)
      setSelected(method)
      initiatePaymentSessionMutation.mutateAsync(
        { provider_id: method },
        { onError: (e) => setError(e instanceof Error ? e.message : "An error occurred") }
      )
    },
    [initiatePaymentSessionMutation]
  )

  const handleSave = async () => {
    if (!selected || saving) return
    if (!activeSession) {
      setSaving(true)
      await initiatePaymentSessionMutation.mutateAsync(
        { provider_id: selected },
        {
          onError: (e) => setError(e instanceof Error ? e.message : "An error occurred"),
          onSettled: () => setSaving(false),
        }
      )
    }
    onDone()
  }

  const getLabel = (id: string) => {
    if (id === "pp_razorpay_razorpay") return "Razorpay"
    if (id.startsWith("pp_stripe")) return "Credit / Debit Card"
    return id
  }

  return (
    <div className="flex flex-col gap-3">
      {filtered.map((method) => {
        const isSelected = selected === method.id
        const isRazorpay = method.id === "pp_razorpay_razorpay"

        return (
          <div key={method.id}>
            <div
              onClick={() => handleChange(method.id)}
              className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected ? "border-[#E799AA] bg-[#FFF5F7]" : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-[#E799AA]" : "border-zinc-300"}`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#E799AA]" />}
                </div>
                <span className="text-sm font-semibold text-zinc-900">{getLabel(method.id)}</span>
              </div>
              {isRazorpay && <RazorpayBadge size="sm" />}
            </div>
            {isStripeFunc(method.id) && isSelected && (
              <div className="mt-2 px-2">
                <StripeCardContainer
                  paymentProviderId={method.id}
                  selectedPaymentOptionId={selected}
                  setError={setError}
                  onSelect={() => handleChange(method.id)}
                  onCardComplete={handleSave}
                />
              </div>
            )}
          </div>
        )
      })}

      {filtered.length === 0 && (
        <p className="text-sm text-zinc-500 text-center py-2">
          No payment methods available.
        </p>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onDone}
          className="flex-1 py-2.5 rounded-full border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-300 hover:bg-zinc-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!selected || saving || initiatePaymentSessionMutation.isPending}
          className="flex-1 py-2.5 rounded-full bg-[#8B1A4A] text-white font-bold text-sm hover:bg-[#7a1640] disabled:opacity-50 transition-all shadow-md"
        >
          {saving || initiatePaymentSessionMutation.isPending ? "Saving..." : "Done"}
        </button>
      </div>
    </div>
  )
}

// ─── Review step ──────────────────────────────────────────────────────────────

const ReviewStep = ({ cart, onBack, goToStep }: ReviewStepProps) => {
  const paidByGiftcard = isPaidWithGiftCard(cart)
  const activeSession = getActivePaymentSession(cart)

  const [editingShipping, setEditingShipping] = useState(false)
  const [editingPayment, setEditingPayment] = useState(false)

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Shipping Address */}
        {cart.shipping_address && (
          <SectionCard
            title="Shipping Address"
            onEdit={() => goToStep(CheckoutStepKey.ADDRESSES)}
            isEditing={false}
          >
            <AddressBlock address={cart.shipping_address} />
          </SectionCard>
        )}

        {/* Shipping Method */}
        <SectionCard
          title="Shipping Method"
          onEdit={() => setEditingShipping(true)}
          isEditing={editingShipping}
          editContent={
            <InlineShippingEditor
              cart={cart}
              onDone={() => setEditingShipping(false)}
            />
          }
        >
          {cart.shipping_methods?.[0] ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-800">
                {cart.shipping_methods[0].name}
              </p>
              <Price
                price={cart.shipping_methods[0].amount}
                currencyCode={cart.currency_code}
                textWeight="plus"
                className="text-sm text-zinc-700"
              />
            </div>
          ) : (
            <p className="text-sm text-zinc-400 italic">Not selected</p>
          )}
        </SectionCard>

        {/* Billing Address */}
        <SectionCard
          title="Billing Address"
          onEdit={() => goToStep(CheckoutStepKey.ADDRESSES)}
          isEditing={false}
        >
          {cart.billing_address ? (
            <AddressBlock address={cart.billing_address} />
          ) : (
            <p className="text-sm text-zinc-500 italic">Same as shipping address</p>
          )}
        </SectionCard>

        {/* Payment Method */}
        <SectionCard
          title="Payment Method"
          onEdit={() => setEditingPayment(true)}
          isEditing={editingPayment}
          editContent={
            <InlinePaymentEditor
              cart={cart}
              onDone={() => setEditingPayment(false)}
            />
          }
        >
          {activeSession && (
            <>
              {activeSession.provider_id === "pp_razorpay_razorpay" ? (
                <RazorpayBadge size="lg" />
              ) : (
                <p className="text-sm font-semibold text-zinc-800">
                  {activeSession.provider_id.replace("pp_", "").replace(/_/g, " ")}
                </p>
              )}
            </>
          )}
          {paidByGiftcard && (
            <p className="text-sm font-semibold text-zinc-800">Gift Card</p>
          )}
          {!activeSession && !paidByGiftcard && (
            <p className="text-sm text-zinc-400 italic">Not selected</p>
          )}
        </SectionCard>
      </div>

      {/* Place Order button */}
      <div className="pt-2">
        <PaymentButton
          cart={cart}
          className="w-full py-4 rounded-full bg-[#8B1A4A] text-white font-bold text-base hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse-soft"
        />
      </div>

      {/* Legal note */}
      <p className="text-xs text-zinc-400 text-center leading-relaxed">
        By placing your order you agree to our{" "}
        <a href="/in/terms" className="text-[#E799AA] underline underline-offset-2 hover:text-[#8B1A4A] transition-colors">
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a href="/in/privacy-policy" className="text-[#E799AA] underline underline-offset-2 hover:text-[#8B1A4A] transition-colors">
          Privacy Policy
        </a>
      </p>

      {/* Back button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-500 hover:text-zinc-700 underline underline-offset-2 transition-colors"
        >
          Back to Address
        </button>
      </div>
    </div>
  )
}

export default ReviewStep
