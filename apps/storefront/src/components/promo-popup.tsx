import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"

const STORAGE_KEY = "fairyfrills_popup_dismissed"
const POPUP_SHOWN_KEY = "popupShown"

interface PromoPopupData {
  id: string
  is_active: boolean
  banner_image_url: string | null
  top_label: string | null
  main_heading: string | null
  sub_text: string | null
  button_text: string | null
  button_link: string | null
  footer_note: string | null
  show_dont_show_again: boolean
  delay_seconds: number
  cooldown_hours: number
}

const shouldShowPopup = (cooldownHours: number): boolean => {
  try {
    // Check if popup has been shown before (first-visit check)
    const hasShownBefore = localStorage.getItem(POPUP_SHOWN_KEY)
    if (hasShownBefore) return false
    
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return true
    const { dismissed_at } = JSON.parse(raw)
    if (!dismissed_at) return true
    const elapsed = Date.now() - dismissed_at
    return elapsed > cooldownHours * 3600 * 1000
  } catch {
    return true
  }
}

const dismissPopup = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissed_at: Date.now() }))
}

const PromoPopup = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const [visible, setVisible] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data } = useQuery({
    queryKey: ["promo-popup"],
    queryFn: () => sdk.client.fetch<{ popup: PromoPopupData | null }>("/store/promo-popup"),
    staleTime: 60000,
  })

  const popup = data?.popup

  const openPopup = useCallback(() => {
    // Mark that popup has been shown on first visit
    localStorage.setItem(POPUP_SHOWN_KEY, "true")
    setAnimating(true)
    setVisible(true)
  }, [])

  const closePopup = useCallback(() => {
    dismissPopup()
    setAnimating(false)
    setTimeout(() => setVisible(false), 300)
  }, [])

  useEffect(() => {
    if (!popup || !popup.is_active) return
    if (!shouldShowPopup(popup.cooldown_hours)) return

    // Use 8 second delay
    const delay = 8000
    timerRef.current = setTimeout(openPopup, delay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [popup, openPopup])

  const handleCta = () => {
    closePopup()
    if (!popup?.button_link) return
    const link = popup.button_link
    if (link.startsWith("http")) {
      window.open(link, "_blank")
    } else {
      const path = link.startsWith("/") ? link : `/${link}`
      navigate({ to: `/$countryCode${path}`, params: { countryCode } })
    }
  }

  if (!visible || !popup) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePopup()
      }}
    >
      {/* Modal */}
      <div
        className={`relative bg-white shadow-2xl overflow-hidden transition-all duration-300
          w-full max-w-md mx-4 rounded-2xl
          md:rounded-2xl
          max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:mx-0 max-md:rounded-b-none max-md:rounded-t-2xl max-md:max-w-none
          ${animating ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}
        `}
        style={{ maxHeight: "90vh" }}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
          aria-label="Close popup"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Banner image with overlay text */}
        {popup.banner_image_url && (
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <img
              src={popup.banner_image_url}
              alt="Promotion"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Overlay text — bottom left */}
            <div className="absolute bottom-0 left-0 p-5 space-y-1">
              {popup.top_label && (
                <p
                  className="font-serif text-white text-sm tracking-widest uppercase"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  {popup.top_label}
                </p>
              )}
              {popup.main_heading && (
                <p
                  className="font-serif text-white text-4xl font-bold leading-none"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {popup.main_heading}
                </p>
              )}
              {popup.sub_text && (
                <p
                  className="text-white/90 text-sm"
                  style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
                >
                  {popup.sub_text}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Lower white section */}
        <div className="p-5 space-y-3 bg-white">
          {/* CTA Button */}
          {popup.button_text && (
            <button
              onClick={handleCta}
              className="w-full py-3 rounded-full font-bold uppercase tracking-wider text-white text-sm transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: "#E799AA" }}
            >
              {popup.button_text}
            </button>
          )}

          {/* Footer note */}
          {popup.footer_note && (
            <p className="text-center text-gray-400 text-xs">
              {popup.footer_note}
            </p>
          )}

          {/* Don't show again */}
          {popup.show_dont_show_again && (
            <label className="flex items-center justify-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#E799AA]"
              />
              <span className="text-xs text-gray-400">Don't show again today</span>
            </label>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromoPopup
