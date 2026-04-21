import ProfilePage from "@/pages/account/profile"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/account/profile")({
  head: () => ({
    meta: [
      { title: "My Profile - Fairy Frills" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
})
