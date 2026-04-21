import React from "react"
import { Cash, CreditCard } from "@medusajs/icons"

const RazorpayIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
    <path d="M9.5 2L4 22h4.5l2-7h3L16 22h4.5L15 2H9.5zm2.5 9.5L13.5 6h.01L15 11.5H12z" fill="#072654"/>
  </svg>
)

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentMethodsData: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  pp_razorpay_razorpay: {
    title: "Razorpay",
    icon: <RazorpayIcon />,
  },
  pp_system_default: {
    title: "Manual Payment",
    icon: <Cash />,
  },
}