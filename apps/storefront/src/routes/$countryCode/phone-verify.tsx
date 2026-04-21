import { createFileRoute, redirect } from "@tanstack/react-router"
import PhoneVerifyPage from "@/pages/phone-verify"
import { sdk } from "@/lib/utils/sdk"
import { isRedirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/phone-verify")({
  validateSearch: (search): { redirect?: string } => {
    return {
      redirect: (search as Record<string, unknown>).redirect as string | undefined,
    }
  },
  beforeLoad: async ({ params, location }) => {
    try {
      await sdk.store.customer.retrieve()
    } catch {
      throw redirect({
        to: "/$countryCode/account/login",
        params: { countryCode: params.countryCode },
        search: { redirect: location.href },
      })
    }
  },
  head: () => ({
    meta: [
      { title: "Phone Verification | Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PhoneVerifyPage,
})
