import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/$countryCode/account/register")({
  beforeLoad: ({ params, location }) => {
    const search = location.search as Record<string, string>
    throw redirect({
      to: "/$countryCode/account/login",
      params: { countryCode: params.countryCode },
      search: search.redirect ? { redirect: search.redirect } : {},
    })
  },
})
