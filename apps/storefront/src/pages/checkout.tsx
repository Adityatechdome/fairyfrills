import { CartEmpty, CHECKOUT_FIELDS } from "@/components/cart"
import CheckoutProgress from "@/components/checkout-progress"
import { Loading } from "@/components/ui/loading"
import { useCart } from "@/lib/hooks/use-cart"
import { useCustomer } from "@/lib/context/customer"
import { type CheckoutStep, CheckoutStepKey } from "@/lib/types/global"
import { useAutoSelectShippingAndPayment } from "@/lib/hooks/use-checkout"
import {
  useLoaderData,
  useLocation,
  useNavigate,
} from "@tanstack/react-router"
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from "react"

const AddressStep = lazy(() => import("@/components/checkout-address-step"))
const ReviewStep = lazy(() => import("@/components/checkout-review-step"))
const CheckoutSummary = lazy(() => import("@/components/checkout-summary"))

const Checkout = () => {
  const { step } = useLoaderData({
    from: "/$countryCode/checkout",
  })
  const { data: cart, isLoading: cartLoading } = useCart({ fields: CHECKOUT_FIELDS })
  const { isAuthenticated, isLoading: authLoading } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = location.pathname.split("/")[1] || "in"
  const autoSelectMutation = useAutoSelectShippingAndPayment()
  const hasAutoSelected = useRef(false)

  // Redirect to login if not authenticated
  const hasRedirected = useRef(false)
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true
      navigate({
        to: "/$countryCode/account/login",
        params: { countryCode },
        search: { redirect: location.href },
      })
    }
  }, [isAuthenticated, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Only 2 visible steps: Addresses → Review
  const steps: CheckoutStep[] = useMemo(() => {
    return [
      {
        key: CheckoutStepKey.ADDRESSES,
        title: "Address",
        description: "Enter your shipping and billing addresses.",
        completed: !!(cart?.shipping_address && cart?.billing_address),
      },
      {
        key: CheckoutStepKey.REVIEW,
        title: "Review & Pay",
        description: "Review your order and place it.",
        completed: false,
      },
    ]
  }, [cart])

  const currentStepIndex = useMemo(
    () => steps.findIndex((s) => s.key === step),
    [step, steps]
  )

  const isTransitioning = useRef(false)
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const goToStep = useCallback((stepKey: CheckoutStepKey, skipGuard = false) => {
    // Delivery and payment edit buttons redirect to the address step
    const resolvedStep =
      stepKey === CheckoutStepKey.DELIVERY || stepKey === CheckoutStepKey.PAYMENT
        ? CheckoutStepKey.ADDRESSES
        : stepKey

    if (skipGuard) {
      isTransitioning.current = true
      clearTimeout(transitionTimer.current)
      transitionTimer.current = setTimeout(() => {
        isTransitioning.current = false
      }, 2000)
    }
    navigate({
      to: `${location.pathname}?step=${resolvedStep}`,
      replace: true,
    })
  }, [location.pathname, navigate])

  // Guard: redirect legacy delivery/payment steps and enforce address completion
  useEffect(() => {
    if (isTransitioning.current) return

    // Redirect legacy step URLs to addresses
    if (step === CheckoutStepKey.DELIVERY || step === CheckoutStepKey.PAYMENT) {
      goToStep(CheckoutStepKey.ADDRESSES)
      return
    }

    if (!cart) return

    if (
      step !== CheckoutStepKey.ADDRESSES &&
      steps[0] &&
      !steps[0].completed
    ) {
      goToStep(CheckoutStepKey.ADDRESSES)
    }
  }, [cart, steps, step, goToStep])

  // After address step completes and we move to review, auto-select shipping + payment
  useEffect(() => {
    if (
      !cart ||
      !cart.region?.id ||
      hasAutoSelected.current ||
      step !== CheckoutStepKey.REVIEW
    ) return

    const hasShipping = !!cart.shipping_methods?.length
    const hasPayment = !!cart.payment_collection?.payment_sessions?.length

    if (!hasShipping || !hasPayment) {
      hasAutoSelected.current = true
      autoSelectMutation.mutate({
        cart_id: cart.id,
        region_id: cart.region.id,
      })
    } else {
      hasAutoSelected.current = true
    }
  }, [cart, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = useCallback(() => {
    goToStep(CheckoutStepKey.REVIEW, true)
  }, [goToStep])

  const handleBack = useCallback(() => {
    goToStep(CheckoutStepKey.ADDRESSES, true)
  }, [goToStep])

  if (authLoading || !isAuthenticated) return <Loading />

  const isAutoSelecting = autoSelectMutation.isPending

  return (
    <div className="min-h-screen bg-[#FFF5F7]">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-sm px-6 py-5 mb-6">
          <CheckoutProgress
            steps={steps}
            currentStepIndex={currentStepIndex}
            handleStepChange={goToStep}
          />
        </div>

        {/* Two column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column — step content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
              {/* Step heading */}
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-semibold text-zinc-900">
                  {steps[currentStepIndex]?.title}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  {steps[currentStepIndex]?.description}
                </p>
              </div>

              <Suspense fallback={<Loading />}>
                {cartLoading && <Loading />}
                {cart && (
                  <>
                    {step === CheckoutStepKey.ADDRESSES && (
                      <AddressStep cart={cart} onNext={handleNext} />
                    )}
                    {step === CheckoutStepKey.REVIEW && (
                      isAutoSelecting ? (
                        <div className="flex flex-col items-center gap-3 py-10">
                          <Loading />
                          <p className="text-sm text-zinc-500">Setting up your order...</p>
                        </div>
                      ) : (
                        <ReviewStep cart={cart} onBack={handleBack} goToStep={goToStep} />
                      )
                    )}
                  </>
                )}
              </Suspense>
            </div>
          </div>

          {/* Right column — order summary */}
          <div className="lg:w-[380px] shrink-0">
            <Suspense fallback={<Loading />}>
              {cartLoading && <Loading />}
              {cart && <CheckoutSummary cart={cart} />}
              {!cart && !cartLoading && <CartEmpty />}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
