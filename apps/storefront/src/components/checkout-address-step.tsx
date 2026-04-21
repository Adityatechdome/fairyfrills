import { lazy, Suspense, useEffect, useState } from "react"
import { useSetCartAddresses } from "@/lib/hooks/use-checkout"
import { getStoredCountryCode } from "@/lib/utils/region"
import { AddressFormData } from "@/lib/types/global"
import { sdk } from "@/lib/utils/sdk"
import { useCustomer } from "@/lib/context/customer"
import { HttpTypes } from "@medusajs/types"
import { useQuery } from "@tanstack/react-query"

// Lazy-load so the heavy country-state-city data is code-split into its own chunk
const AddressForm = lazy(() => import("@/components/address-form"))

const AddressFormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-12 rounded-xl bg-zinc-100" />
      <div className="h-12 rounded-xl bg-zinc-100" />
    </div>
    <div className="h-12 rounded-xl bg-zinc-100" />
    <div className="h-12 rounded-xl bg-zinc-100" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-12 rounded-xl bg-zinc-100" />
      <div className="h-12 rounded-xl bg-zinc-100" />
      <div className="h-12 rounded-xl bg-zinc-100" />
    </div>
  </div>
)

const useSavedAddresses = () => {
  return useQuery({
    queryKey: ["customer", "addresses"],
    queryFn: async () => {
      try {
        const { addresses } = await sdk.store.customer.listAddress()
        return addresses || []
      } catch {
        return []
      }
    },
    staleTime: 1000 * 60 * 5,
  })
}

interface AddressStepProps {
  cart: HttpTypes.StoreCart;
  onNext: () => void;
}

const AddressStep = ({ cart, onNext }: AddressStepProps) => {
  const setAddressesMutation = useSetCartAddresses()
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShippingAddressValid, setIsShippingAddressValid] = useState(false)
  const [isBillingAddressValid, setIsBillingAddressValid] = useState(false)
  const { customer } = useCustomer()
  const email = customer?.email || cart.email || ""
  const storedCountryCode = getStoredCountryCode()
  const { data: savedAddresses } = useSavedAddresses()

  const firstSaved = savedAddresses?.[0]
  const cartHasAddress = !!(cart.shipping_address?.address_1)

  const [shippingAddress, setShippingAddress] = useState<AddressFormData>({
    first_name: cart.shipping_address?.first_name || "",
    last_name: cart.shipping_address?.last_name || "",
    company: cart.shipping_address?.company || "",
    address_1: cart.shipping_address?.address_1 || "",
    address_2: cart.shipping_address?.address_2 || "",
    city: cart.shipping_address?.city || "",
    postal_code: cart.shipping_address?.postal_code || "",
    province: cart.shipping_address?.province || "",
    country_code:
      cart.shipping_address?.country_code || storedCountryCode || "",
    phone: cart.shipping_address?.phone || "",
  })

  // Auto-fill with first saved address when loaded (only if cart has no address yet)
  useEffect(() => {
    if (!cartHasAddress && firstSaved && !shippingAddress.address_1) {
      setShippingAddress({
        first_name: firstSaved.first_name || "",
        last_name: firstSaved.last_name || "",
        company: firstSaved.company || "",
        address_1: firstSaved.address_1 || "",
        address_2: firstSaved.address_2 || "",
        city: firstSaved.city || "",
        postal_code: firstSaved.postal_code || "",
        province: firstSaved.province || "",
        country_code: firstSaved.country_code || storedCountryCode || "",
        phone: firstSaved.phone || "",
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstSaved])

  const [billingAddress, setBillingAddress] = useState<AddressFormData>({
    first_name: cart.billing_address?.first_name || "",
    last_name: cart.billing_address?.last_name || "",
    company: cart.billing_address?.company || "",
    address_1: cart.billing_address?.address_1 || "",
    address_2: cart.billing_address?.address_2 || "",
    city: cart.billing_address?.city || "",
    postal_code: cart.billing_address?.postal_code || "",
    province: cart.billing_address?.province || "",
    country_code: cart.billing_address?.country_code || storedCountryCode || "",
    phone: cart.billing_address?.phone || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("email", email)

      Object.entries(shippingAddress).forEach(([key, value]) => {
        submitData.append(`shipping_address.${key}`, value)
      })

      const billingData = sameAsBilling ? shippingAddress : billingAddress
      Object.entries(billingData).forEach(([key, value]) => {
        submitData.append(`billing_address.${key}`, value)
      })

      await setAddressesMutation.mutateAsync(submitData)
      onNext()
    } catch {
      // Error is handled by mutation state
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return isShippingAddressValid && (isBillingAddressValid || sameAsBilling)
  }

  // Pre-fill country from stored code if cart has no address yet
  useEffect(() => {
    if (!cartHasAddress && !shippingAddress.country_code && storedCountryCode) {
      setShippingAddress((prev) => ({ ...prev, country_code: storedCountryCode }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedCountryCode])

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Shipping Address */}
      <div>
        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4">
          Shipping Address
        </h3>
        <Suspense fallback={<AddressFormSkeleton />}>
          <AddressForm
            addressFormData={shippingAddress}
            setAddressFormData={setShippingAddress}
            setIsFormValid={setIsShippingAddressValid}
          />
        </Suspense>
      </div>

      {/* Same as billing checkbox */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            id="same_as_billing"
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(!!e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
              sameAsBilling
                ? "bg-[#E799AA] border-[#E799AA]"
                : "bg-white border-zinc-300 group-hover:border-[#E799AA]"
            }`}
          >
            {sameAsBilling && (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path
                  d="M2 5.5L4.5 8L9 3"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-zinc-700">
          Billing address is the same as shipping address
        </span>
      </label>

      {/* Billing Address (if different) */}
      {!sameAsBilling && (
        <div>
          <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider mb-4">
            Billing Address
          </h3>
          <Suspense fallback={<AddressFormSkeleton />}>
            <AddressForm
              addressFormData={billingAddress}
              setAddressFormData={setBillingAddress}
              setIsFormValid={setIsBillingAddressValid}
            />
          </Suspense>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className="w-full py-3.5 rounded-full bg-[#8B1A4A] text-white font-bold text-base tracking-wide hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? "Saving..." : "Next"}
        </button>
      </div>
    </form>
  )
}

export default AddressStep
