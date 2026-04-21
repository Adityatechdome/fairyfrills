import Layout from "@/components/layout"
import { listRegions } from "@/lib/data/regions"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router"
import { lazy } from "react"
import appCss from "../styles/app.css?url"

const NotFound = lazy(() => import("@/components/not-found"))

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: async ({ context }) => {
    const { queryClient } = context
    
    try {
      await queryClient.ensureQueryData({
        queryKey: ["regions"],
        queryFn: () => listRegions({ fields: "id, name, currency_code, *countries" }),
      })
    } catch (e) {
      console.error("Failed to pre-populate regions:", e)
    }
    
    return {}
  },
  head: () => ({
    links: [
      { rel: "icon", type: "image/png", sizes: "32x32", href: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/favicon-32x32-01KJYZK48264WKR2PMZ27TBKCP.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/favicon-16x16-01KJYZK1DHAJMAN446HX5MVH5S.png" },
      { rel: "apple-touch-icon", href: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/favicon-32x32-01KJYZK48264WKR2PMZ27TBKCP.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://fairyfrills.in" },
      { rel: "alternate", hreflang: "en-IN", href: "https://fairyfrills.in/in" },
      { rel: "alternate", hreflang: "x-default", href: "https://fairyfrills.in" },
    ],
    meta: [
      { title: "Fairy Frills - Handcrafted Baby Girl Dresses & Mother Daughter Outfits" },
      { charSet: "UTF-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        name: "description",
        content: "Fairy Frills is a designer clothing brand creating handcrafted baby girl dresses and elegant mother daughter twinning outfits for life's most special moments.",
      },
      { property: "og:site_name", content: "Fairy Frills" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "640" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/generated-01KKJYBYV1EG0GZ7HZTENPPPWK-01KKJYBYV2JVY7WQ8V629ERKAQ.jpeg" },
    ],
    scripts: [
      {
        src: "https://www.googletagmanager.com/gtag/js?id=G-2GC980VESJ",
        async: true,
      },
      {
        children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-2GC980VESJ');`,
      },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootComponent,
})

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Layout />
        </QueryClientProvider>

        <Scripts />
      </body>
    </html>
  )
}
