import { createFileRoute } from "@tanstack/react-router"

const MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000"

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const response = await fetch(`${MEDUSA_BACKEND_URL}/store/sitemap`)
          const xml = await response.text()
          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=3600",
            },
          })
        } catch {
          return new Response("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"></urlset>", {
            headers: { "Content-Type": "application/xml; charset=utf-8" },
          })
        }
      },
    },
  },
})
