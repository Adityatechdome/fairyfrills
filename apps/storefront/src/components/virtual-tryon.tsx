import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"

type SiteSettings = {
  virtual_tryon_html: string | null
  virtual_tryon_bg_image_url: string | null
}

const useSiteSettings = () =>
  useQuery<SiteSettings>({
    queryKey: ["site-settings-tryon"],
    queryFn: async () => {
      const data = await sdk.client.fetch<SiteSettings>("/store/site-settings")
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

export const VirtualTryOn = () => {
  const { data } = useSiteSettings()
  const [overlayOpen, setOverlayOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const html = data?.virtual_tryon_html
  const bgImage = data?.virtual_tryon_bg_image_url

  // Don't render section if no HTML content is configured
  if (data !== undefined && !html) return null

  const handleOpen = () => setOverlayOpen(true)
  const handleClose = () => setOverlayOpen(false)

  return (
    <>
      {/* Section anchor */}
      <section id="virtual-tryon" className="relative overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={
            bgImage
              ? { backgroundImage: `url(${bgImage})` }
              : { background: "linear-gradient(135deg, #f9d1dc 0%, #f0a8bb 40%, #e799aa 100%)" }
          }
        />
        {/* Subtle overlay tint for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: bgImage
              ? "linear-gradient(to bottom, rgba(231,153,170,0.35) 0%, rgba(231,153,170,0.55) 100%)"
              : "transparent",
          }}
        />

        {/* Content */}
        <div className="relative content-container py-20 sm:py-28 flex flex-col items-center text-center gap-y-6">
          {/* Label */}
          <span className="text-xs font-semibold tracking-[0.25em] text-white/80 uppercase">
            Experience the magic
          </span>

          {/* Heading */}
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-white drop-shadow-sm leading-tight"
            style={{ textShadow: "0 2px 12px rgba(180,70,100,0.18)" }}
          >
            Virtual Try-On
          </h2>

          {/* CTA Button */}
          <button
            onClick={handleOpen}
            className="group relative mt-2 inline-flex items-center gap-x-2.5 px-8 py-3.5 rounded-full font-serif text-sm tracking-[0.08em] text-white transition-all duration-300"
            style={{
              background: "rgba(180,70,100,0.55)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 4px 20px rgba(180,70,100,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <span>Show Virtual Try-On</span>
          </button>

          {/* Subtle sparkles */}
          <div className="absolute top-6 left-[8%] text-white/30 text-xl pointer-events-none select-none" aria-hidden>✦</div>
          <div className="absolute bottom-8 right-[10%] text-white/25 text-2xl pointer-events-none select-none" aria-hidden>✦</div>
          <div className="absolute top-1/2 left-[3%] text-white/20 text-sm pointer-events-none select-none" aria-hidden>✧</div>
          <div className="absolute top-1/3 right-[5%] text-white/20 text-sm pointer-events-none select-none" aria-hidden>✧</div>
        </div>
      </section>

      {/* Fullscreen overlay */}
      {overlayOpen && html && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: "#000" }}
        >
          {/* Close bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5 shrink-0"
            style={{
              background: "linear-gradient(90deg, #c75b7a 0%, #e799aa 100%)",
            }}
          >
            <span className="font-serif text-white text-sm tracking-[0.12em] font-semibold flex items-center gap-x-1.5">
              <span>✨</span> Virtual Try-On
            </span>
            <button
              onClick={handleClose}
              className="text-white/90 hover:text-white transition-colors flex items-center gap-x-1 text-xs font-medium tracking-wider uppercase"
              aria-label="Close Virtual Try-On"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>

          {/* Rendered HTML in sandboxed iframe */}
          <div className="flex-1 overflow-hidden">
            <TryOnFrame html={html} />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Renders custom HTML inside an iframe with camera + microphone permissions.
 * Using srcdoc so the HTML is fully self-contained.
 */
const TryOnFrame = ({ html }: { html: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Wrap user HTML in a full-page document if it's a snippet (not a full HTML doc)
  const isFullDoc = html.trim().toLowerCase().startsWith("<!doctype") || html.trim().toLowerCase().startsWith("<html")
  const srcdoc = isFullDoc
    ? html
    : `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body > * { width: 100% !important; height: 100% !important; }
  iframe { border: none; width: 100%; height: 100%; display: block; }
</style>
</head>
<body>${html}</body>
</html>`

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      title="Virtual Try-On"
      className="w-full h-full border-0"
      allow="camera; microphone; accelerometer; gyroscope; autoplay; fullscreen; display-capture; xr-spatial-tracking"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-downloads allow-modals"
      style={{ display: "block", background: "#000" }}
    />
  )
}
