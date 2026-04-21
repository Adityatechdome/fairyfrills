import LoginPage from "@/pages/account/login"
import { createFileRoute } from "@tanstack/react-router"

type LoginSearch = {
  redirect?: string
}

export const Route = createFileRoute("/$countryCode/account/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In - Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
})
