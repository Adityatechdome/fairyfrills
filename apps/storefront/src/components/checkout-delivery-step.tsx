import { Price } from "@/components/ui/price"
import { Loading } from "@/components/ui/loading"
import {
  useSetCartShippingMethod,
  useShippingOptions,
} from "@/lib/hooks/use-checkout"
import { calculatePriceForShippingOption } from "@/lib/utils/checkout"
import { HttpTypes } from "@medusajs/types"
import { useEffect, useRef, useState } from "react"

interface DeliveryStepProps {
  cart: HttpTypes.StoreCart;
  onNext: () => void;
  onBack: () => void;
}

interface ShippingOptionCardProps {
  option: HttpTypes.StoreCartShippingOption;
  cart: HttpTypes.StoreCart;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ShippingOptionCard = ({ option, cart, isSelected, onSelect }: ShippingOptionCardProps) => {
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(undefined)
  const isMounted = useRef(true)
  const isDisabled = option.price_type === "calculated" && typeof calculatedPrice !== "number"
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
    <label
      className={`block cursor-pointer transition-all duration-200 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div
        onClick={() => !isDisabled && onSelect(option.id)}
        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 ${
          isSelected
            ? "border-[#E799AA] bg-[#FFF5F7] shadow-sm"
            : "border-zinc-200 bg-white hover:border-zinc-300"
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Custom radio */}
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
              isSelected ? "border-[#E799AA]" : "border-zinc-300"
            }`}
          >
            {isSelected && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#E799AA]" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{option.name}</p>
            {typeof option.data?.description === "string" && (
              <p className="text-xs text-zinc-500 mt-0.5">{option.data.description}</p>
            )}
          </div>
        </div>
        <div className="shrink-0 font-bold">
          {price !== undefined ? (
            <Price price={price} currencyCode={cart.currency_code} textWeight="plus" />
          ) : (
            <Loading className="w-4 h-4" rows={1} />
          )}
        </div>
      </div>
    </label>
  )
}

const DeliveryStep = ({ cart, onNext, onBack }: DeliveryStepProps) => {
  const { data: shippingOptions } = useShippingOptions({ cart_id: cart.id })
  const setShippingMethodMutation = useSetCartShippingMethod()
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    cart.shipping_methods?.[0]?.shipping_option_id || ""
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (!hasAutoSelected.current && !selectedOptionId && shippingOptions && shippingOptions.length > 0) {
      hasAutoSelected.current = true
      setSelectedOptionId(shippingOptions[0].id)
    }
  }, [shippingOptions, selectedOptionId])

  const handleSubmit = async () => {
    if (!selectedOptionId || isSubmitting) return
    setIsSubmitting(true)
    await setShippingMethodMutation.mutateAsync(
      { shipping_option_id: selectedOptionId },
      {
        onSuccess: () => onNext(),
        onSettled: () => setIsSubmitting(false),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {shippingOptions?.map((option) => (
          <ShippingOptionCard
            key={option.id}
            option={option}
            cart={cart}
            isSelected={selectedOptionId === option.id}
            onSelect={setSelectedOptionId}
          />
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-full border-2 border-zinc-200 text-zinc-700 font-semibold text-sm hover:border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 transition-all duration-200"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOptionId || isSubmitting}
          className="flex-1 py-3.5 rounded-full bg-[#8B1A4A] text-white font-bold text-sm hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isSubmitting ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  )
}

export default DeliveryStep
