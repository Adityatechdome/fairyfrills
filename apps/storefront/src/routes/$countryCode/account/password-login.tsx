import PasswordLoginPage from "@/pages/account/password-login"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/account/password-login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In - Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PasswordLoginPage,
})
