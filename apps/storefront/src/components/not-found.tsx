import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"

const Sparkle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
  </svg>
)

const CATEGORIES = [
  { name: "Birthday Outfits", handle: "birthday-outfits" },
  { name: "Mother & Daughter", handle: "mother-daughter-combos" },
  { name: "Theme Dresses", handle: "themedresses" },
  { name: "Ethnic Wear", handle: "ethnic" },
]

const NotFound = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-16"
      style={{
        background: "linear-gradient(135deg, #fff8f9 0%, #fdf0f3 40%, #fceef2 70%, #fdf5ef 100%)",
      }}
    >
      {/* Decorative background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -top-24 right-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #f7c5d0 0%, #fce8ee 40%, transparent 70%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 -left-24 w-[350px] h-[350px] rounded-full opacity-15"
        style={{ background: "radial-gradient(circle, #fad4a4 0%, #fce9d5 40%, transparent 70%)" }}
      />

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Decorative sparkles */}
        <Sparkle className="absolute -top-8 left-8 w-4 h-4 text-[#E799AA] opacity-50" />
        <Sparkle className="absolute top-4 right-4 w-3 h-3 text-[#f7c5a0] opacity-40" />
        <Sparkle className="absolute bottom-0 left-0 w-3 h-3 text-[#E799AA] opacity-30" />

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/ChatGPT-Image-Mar-16-2026-01_01_02-PM-1-01KKTRZ1RX02Z34GZ7S0HA1GT4.png"
            alt="Fairy Frills"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* 404 number */}
        <div className="relative mb-4">
          <span
            className="font-serif block leading-none select-none"
            style={{
              fontSize: "clamp(6rem, 20vw, 10rem)",
              background: "linear-gradient(135deg, #f2c4cf 0%, #E799AA 45%, #d4788e 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              opacity: 0.5,
            }}
          >
            404
          </span>
        </div>

        {/* Divider with sparkle */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #E799AA)" }} />
          <Sparkle className="w-3 h-3 text-[#E799AA]" />
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #E799AA, transparent)" }} />
        </div>

        {/* Main message */}
        <h1 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: "#2d2020" }}>
          Page Not Found
        </h1>
        <p className="text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed" style={{ color: "#7a6068" }}>
          The page you're looking for has drifted away like fairy dust. Let's get you back to the magic.
        </p>

        {/* Go Home button */}
        <Link
          to="/$countryCode"
          params={{ countryCode }}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide text-white mb-10 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
          style={{
            background: "linear-gradient(135deg, #c4607a 0%, #E799AA 50%, #c9547e 100%)",
            boxShadow: "0 4px 20px rgba(228, 121, 150, 0.4)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go Back Home
        </Link>

        {/* Category links */}
        <div>
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: "#c4607a" }}
          >
            Explore Our Collections
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.handle}
                to="/$countryCode/categories/$handle"
                params={{ countryCode, handle: cat.handle }}
                className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid #f2c4cf",
                  color: "#c4607a",
                  backdropFilter: "blur(8px)",
                }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
