import { useCompleteCartOrder } from "@/lib/hooks/use-checkout"
import { isManual, isRazorpay, isStripe } from "@/lib/utils/checkout"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { sdk } from "@/lib/utils/sdk"
import { HttpTypes } from "@medusajs/types"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  className?: string
}

const PaymentButton = ({ cart, className }: PaymentButtonProps) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isRazorpay(paymentSession?.provider_id):
      return (
        <RazorpayPaymentButton
          cart={cart}
          notReady={notReady}
          className={className}
          session={paymentSession!}
        />
      )
    case isStripe(paymentSession?.provider_id):
      return <StripePaymentButton notReady={notReady} className={className} />
    case isManual(paymentSession?.provider_id):
      return <ManualPaymentButton notReady={notReady} className={className} />
    default:
      return (
        <button
          disabled
          className="w-full py-4 rounded-full bg-zinc-200 text-zinc-500 font-bold text-base cursor-not-allowed"
        >
          Select a payment method
        </button>
      )
  }
}

const RazorpayPaymentButton = ({
  cart,
  notReady,
  className,
  session,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  className?: string
  session: HttpTypes.StorePaymentSession
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const completeOrderMutation = useCompleteCartOrder()

  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => setScriptLoaded(true)
      script.onerror = () =>
        setErrorMessage("Failed to load Razorpay. Please refresh the page.")
      document.body.appendChild(script)
    } else {
      setScriptLoaded(true)
    }
  }, [])

  const handlePayment = useCallback(async () => {
    if (!scriptLoaded || !(window as any).Razorpay) {
      setErrorMessage("Razorpay is still loading. Please wait.")
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const sessionData = session.data as Record<string, unknown> | undefined
    const razorpayOrderId = sessionData?.razorpay_order_id as string
    const razorpayKeyId = sessionData?.razorpay_key_id as string

    if (!razorpayOrderId || !razorpayKeyId) {
      setErrorMessage(
        "Payment session is not properly initialized. Please go back and try again."
      )
      setSubmitting(false)
      return
    }

    const options = {
      key: razorpayKeyId,
      amount: sessionData?.amount as number,
      currency: (sessionData?.currency as string) || "INR",
      name: "Fairy Frills",
      description: "Order Payment",
      order_id: razorpayOrderId,
      prefill: {
        name: `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim(),
        email: cart.email || "",
        contact: cart.shipping_address?.phone || "",
      },
      theme: {
        color: "#E799AA",
      },
      handler: async (response: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
      }) => {
        try {
          await sdk.client.fetch("/store/razorpay/authorize", {
            method: "POST",
            body: {
              cart_id: cart.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
          })

          const order = await completeOrderMutation.mutateAsync()

          navigate({
            to: `/${countryCode}/order/${order.id}/confirmed`,
            replace: true,
          })
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Payment verification failed. Please contact support."
          )
          setSubmitting(false)
        }
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false)
        },
        confirm_close: true,
      },
    }

    try {
      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", (response: any) => {
        setErrorMessage(
          response.error?.description || "Payment failed. Please try again."
        )
        setSubmitting(false)
      })
      rzp.open()
    } catch (error) {
      setErrorMessage("Failed to open payment gateway. Please try again.")
      setSubmitting(false)
    }
  }, [
    scriptLoaded,
    session,
    cart,
    completeOrderMutation,
    navigate,
    countryCode,
  ])

  const buttonClass = className || "w-full py-4 rounded-full bg-[#8B1A4A] text-white font-bold text-base hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"

  return (
    <>
      <button
        disabled={notReady || submitting || !scriptLoaded}
        onClick={handlePayment}
        data-testid="place-order-button"
        className={buttonClass}
      >
        {submitting
          ? "Processing..."
          : !scriptLoaded
            ? "Loading..."
            : "Place Order"}
      </button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </>
  )
}

const StripePaymentButton = ({
  notReady,
  className,
}: {
  notReady: boolean
  className?: string
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const completeOrderMutation = useCompleteCartOrder()

  const handlePayment = async () => {
    setErrorMessage(null)

    try {
      const order = await completeOrderMutation.mutateAsync()

      navigate({
        to: `/${countryCode}/order/${order.id}/confirmed`,
        replace: true,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Payment failed"
      )
    }
  }

  const buttonClass = className || "w-full py-4 rounded-full bg-[#8B1A4A] text-white font-bold text-base hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"

  return (
    <>
      <button
        disabled={notReady || completeOrderMutation.isPending}
        onClick={handlePayment}
        data-testid="place-order-button"
        className={buttonClass}
      >
        Place Order
      </button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </>
  )
}

const ManualPaymentButton = ({
  notReady,
  className,
}: {
  notReady: boolean
  className?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname)
  const completeOrderMutation = useCompleteCartOrder()

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    try {
      const order = await completeOrderMutation.mutateAsync()

      navigate({
        to: `/${countryCode}/order/${order.id}/confirmed`,
        replace: true,
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to place order"
      )
    } finally {
      setSubmitting(false)
    }
  }

  const buttonClass = className || "w-full py-4 rounded-full bg-[#8B1A4A] text-white font-bold text-base hover:bg-[#7a1640] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"

  return (
    <>
      <button
        disabled={notReady || submitting}
        onClick={handlePayment}
        data-testid="place-order-button"
        className={buttonClass}
      >
        Place Order
      </button>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
      )}
    </>
  )
}

export default PaymentButton
