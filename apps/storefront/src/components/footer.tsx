import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useState, useRef } from "react"

const NEWSLETTER_KEY = "fairyfrills_newsletter_subscribed"

const LOGO_URL = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/Fairy-frills-logo-01KP7ZMG8G55FCQ1KZ3Q94QJAZ.png"

type FooterLink = {
  id: string
  label: string
  url: string
  column: string
  sort_order: number
}

const STATIC_COMPANY_INFO: FooterLink[] = [
  { id: "s-about", label: "About Us", url: "/in/about", column: "company_info", sort_order: 1 },
  { id: "s-contact", label: "Contact Us", url: "/in/contact", column: "company_info", sort_order: 2 },
  { id: "s-blog", label: "Blog", url: "/in/blogs", column: "company_info", sort_order: 3 },
]

const STATIC_COMPANY_POLICIES: FooterLink[] = [
  { id: "s-privacy", label: "Privacy Policy", url: "/in/privacy-policy", column: "company_policies", sort_order: 1 },
  { id: "s-shipping", label: "Shipping Policy", url: "/in/shipping-policy", column: "company_policies", sort_order: 2 },
  { id: "s-terms", label: "Terms & Conditions", url: "/in/terms", column: "company_policies", sort_order: 3 },
  { id: "s-returns", label: "Return Policy", url: "/in/return-policy", column: "company_policies", sort_order: 4 },
]

/* ─── Sparkle particle data ─── */
const SPARKLES = [
  { top: "8%",  left: "4%",   size: 10, delay: "0s",    dur: "3.1s", anim: "footer-star-twinkle-1" },
  { top: "22%", left: "11%",  size: 6,  delay: "0.7s",  dur: "2.8s", anim: "footer-star-twinkle-2" },
  { top: "60%", left: "7%",   size: 8,  delay: "1.4s",  dur: "3.4s", anim: "footer-star-twinkle-3" },
  { top: "80%", left: "2%",   size: 5,  delay: "0.3s",  dur: "2.5s", anim: "footer-star-twinkle-1" },
  { top: "14%", left: "88%",  size: 9,  delay: "0.9s",  dur: "3.0s", anim: "footer-star-twinkle-2" },
  { top: "35%", left: "94%",  size: 6,  delay: "0.2s",  dur: "2.7s", anim: "footer-star-twinkle-3" },
  { top: "72%", left: "91%",  size: 7,  delay: "1.1s",  dur: "3.3s", anim: "footer-star-twinkle-1" },
  { top: "50%", left: "48%",  size: 5,  delay: "1.8s",  dur: "4.0s", anim: "footer-star-twinkle-2" },
  { top: "25%", left: "60%",  size: 4,  delay: "0.5s",  dur: "2.6s", anim: "footer-star-twinkle-3" },
  { top: "88%", left: "75%",  size: 6,  delay: "1.6s",  dur: "3.2s", anim: "footer-star-twinkle-1" },
  { top: "45%", left: "22%",  size: 4,  delay: "2.1s",  dur: "3.7s", anim: "footer-star-twinkle-2" },
  { top: "90%", left: "40%",  size: 5,  delay: "0.8s",  dur: "2.9s", anim: "footer-star-twinkle-3" },
]

/* ─── Star SVG ─── */
const StarIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
  </svg>
)

/* ─── Hovered nav link ─── */
const FooterNavLink = ({ href, label, isExternal }: { href: string; label: string; isExternal?: boolean }) => {
  const [hovered, setHovered] = useState(false)
  const inner = (
    <span
      className="group relative inline-flex items-center gap-1.5 text-sm tracking-wide transition-colors duration-300"
      style={{ color: hovered ? "var(--color-primary-light)" : "var(--color-footer-link)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="transition-all duration-300 ease-out"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(-6px)",
          color: "#E799AA",
        }}
      >
        →
      </span>
      <span className="relative">
        {label}
        <span
          className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#E799AA] to-[#f2c4cf] transition-all duration-300 ease-out"
          style={{ width: hovered ? "100%" : "0%" }}
        />
      </span>
    </span>
  )

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block">
        {inner}
      </a>
    )
  }
  return (
    <Link to={href} className="block">
      {inner}
    </Link>
  )
}

/* ─── Section heading ─── */
const SectionHeading = ({ children }: { children: React.ReactNode }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative inline-block cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <h4
        className="font-sans text-[0.6875rem] font-semibold uppercase mb-1"
        style={{ color: "var(--color-footer-label)", letterSpacing: "var(--tracking-footer-label)" }}
      >
        {children}
      </h4>
      <span
        className="block h-px transition-all duration-400 ease-out"
        style={{
          width: hovered ? "100%" : "24px",
          background: "linear-gradient(to right, #E799AA, #f2c4cf)",
        }}
      />
    </div>
  )
}

/* ─── Social icon button ─── */
const SocialButton = ({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) => {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ease-out"
      style={{
        color: hovered ? "#E799AA" : "#d4c5c8",
        boxShadow: hovered
          ? "0 0 0 1.5px #E799AA, 0 0 14px 2px rgba(231,153,170,0.35)"
          : "0 0 0 1px rgba(231,153,170,0.2)",
        background: hovered ? "rgba(231,153,170,0.08)" : "transparent",
      }}
    >
      {children}
    </a>
  )
}

/* ─── Main Footer ─── */
const Footer = () => {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dustKey, setDustKey] = useState(0)
  const [showDust, setShowDust] = useState(false)
  const copyrightRef = useRef<HTMLSpanElement>(null)

  // Newsletter state is session-only — do not restore from localStorage

  const { data: footerData } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => sdk.client.fetch<any>("/store/footer"),
    staleTime: 60000,
  })

  const { data: linksData } = useQuery({
    queryKey: ["footer-links"],
    queryFn: () =>
      sdk.client.fetch<{
        company_info: FooterLink[]
        company_policies: FooterLink[]
      }>("/store/footer-links"),
    staleTime: 60000,
  })

  const footer = footerData?.footer
  const companyInfo = (linksData?.company_info && linksData.company_info.length > 0)
    ? linksData.company_info
    : STATIC_COMPANY_INFO
  const companyPolicies = (linksData?.company_policies && linksData.company_policies.length > 0)
    ? linksData.company_policies
    : STATIC_COMPANY_POLICIES

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return

    setSubmitting(true)
    try {
      await sdk.client.fetch("/store/contact", {
        method: "POST",
        body: {
          first_name: "Newsletter",
          last_name: "Subscriber",
          email: trimmedEmail,
          message: "Subscribed via footer newsletter form.",
        },
      })
    } catch {
      // Store email even if API call fails — UX should not block
    } finally {
      setSubmitting(false)
    }

    setSubscribed(true)
    setEmail("")
  }

  const handleCopyrightHover = () => {
    setDustKey((k) => k + 1)
    setShowDust(true)
    setTimeout(() => setShowDust(false), 700)
  }

  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #2a1f24 0%, #1a0f15 45%, #110b11 100%)",
      }}
    >
      {/* Sparkle particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              top: s.top,
              left: s.left,
              color: "#E799AA",
              animation: `${s.anim} ${s.dur} ${s.delay} ease-in-out infinite`,
            }}
          >
            <StarIcon size={s.size} />
          </span>
        ))}
      </div>

      {/* Top fade edge */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, #E799AA40, transparent)" }}
        aria-hidden="true"
      />

      {/* ── Main grid ── */}
      <div className="relative z-10 content-container py-14 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Column 1: Brand ── */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src={LOGO_URL}
                alt="Fairy Frills"
                className="w-10 h-10 object-contain"
              />
              <h3 className="font-serif text-2xl md:text-3xl font-semibold tracking-wide leading-none">
                <span style={{ color: "var(--color-footer-brand)" }}>FAIRY </span>
                <span
                  style={{
                    color: "var(--color-eyebrow)",
                    textShadow: "0 0 18px rgba(231,153,170,0.7), 0 0 40px rgba(231,153,170,0.3)",
                  }}
                >
                  FRILLS
                </span>
              </h3>
            </div>

            {/* Description */}
            {footer?.brand_description && (
              <p
                className="text-sm leading-relaxed italic max-w-xs"
                style={{ color: "var(--color-footer-muted)" }}
              >
                {footer.brand_description}
              </p>
            )}

            {/* Gradient divider */}
            <div
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(to right, transparent, #E799AA, transparent)",
              }}
            />

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-1">
              {footer?.instagram_url && (
                <SocialButton href={footer.instagram_url} label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialButton>
              )}
              {footer?.youtube_url && (
                <SocialButton href={footer.youtube_url} label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialButton>
              )}
              {footer?.facebook_url && (
                <SocialButton href={footer.facebook_url} label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialButton>
              )}
              {footer?.twitter_url && (
                <SocialButton href={footer.twitter_url} label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialButton>
              )}
              {footer?.pinterest_url && (
                <SocialButton href={footer.pinterest_url} label="Pinterest">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </SocialButton>
              )}
            </div>
          </div>

          {/* ── Column 2: Company Info ── */}
          <div className="flex flex-col gap-5">
            <SectionHeading>Company Info</SectionHeading>
            <nav className="flex flex-col gap-3.5">
              {companyInfo.map((link) => {
                const isExt = link.url.startsWith("http")
                return (
                  <FooterNavLink
                    key={link.id}
                    href={link.url}
                    label={link.label}
                    isExternal={isExt}
                  />
                )
              })}
            </nav>
          </div>

          {/* ── Column 3: Company Policies ── */}
          <div className="flex flex-col gap-5">
            <SectionHeading>Company Policies</SectionHeading>
            <nav className="flex flex-col gap-3.5">
              {companyPolicies.map((link) => {
                const isExt = link.url.startsWith("http")
                return (
                  <FooterNavLink
                    key={link.id}
                    href={link.url}
                    label={link.label}
                    isExternal={isExt}
                  />
                )
              })}
            </nav>
          </div>

          {/* ── Column 4: Newsletter ── */}
          <div className="flex flex-col gap-4">
            <h4
              className="font-serif text-xl font-normal leading-snug"
              style={{
                color: "var(--color-eyebrow)",
                textShadow: "0 0 14px rgba(231,153,170,0.5)",
              }}
            >
              Stay in the Magic
            </h4>
            <p className="text-sm leading-relaxed italic" style={{ color: "var(--color-footer-muted)" }}>
              Get exclusive offers and new arrivals straight to your inbox.
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(231,153,170,0.25)",
                    color: "#f5ede8",
                    backdropFilter: "blur(8px)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(231,153,170,0.7)"
                    e.target.style.boxShadow = "0 0 0 3px rgba(231,153,170,0.12)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(231,153,170,0.25)"
                    e.target.style.boxShadow = "none"
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(110deg, #E799AA 0%, #d47a8f 40%, #E799AA 60%, #f2c4cf 100%)",
                    backgroundSize: "200% auto",
                    color: "#fff",
                    animation: submitting ? "none" : "footer-btn-shimmer 2.2s linear infinite",
                    boxShadow: "0 4px 18px rgba(231,153,170,0.35)",
                  }}
                >
                  {submitting ? "Joining..." : "Subscribe"}
                </button>
              </form>
            ) : (
              <div
                className="flex flex-col gap-1.5 rounded-lg px-4 py-3 text-sm"
                style={{
                  background: "rgba(231,153,170,0.1)",
                  border: "1px solid rgba(231,153,170,0.3)",
                  color: "#f2c4cf",
                }}
              >
                <span className="font-semibold text-base" style={{ color: "var(--color-eyebrow)" }}>
                  You're in the Magic
                </span>
                <span className="text-xs italic" style={{ color: "var(--color-footer-muted)" }}>
                  Welcome to the Fairy Frills family. Watch your inbox for something special.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10">
        {/* Full-width gradient divider */}
        <div
          className="h-px w-full"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(231,153,170,0.6) 30%, rgba(231,153,170,0.6) 70%, transparent)",
          }}
        />

        <div className="content-container py-5">
          <div className="flex items-center justify-center relative">
            {/* Left sparkle */}
            <span
              className="absolute left-0 text-[#E799AA] opacity-40"
              style={{ animation: "footer-sparkle 3.1s 0.3s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <StarIcon size={8} />
            </span>

            {/* Copyright */}
            <span
              ref={copyrightRef}
              className="text-xs tracking-[0.18em] uppercase cursor-default select-none relative"
              style={{ color: "var(--color-footer-copyright)" }}
              onMouseEnter={handleCopyrightHover}
            >
              &copy; {new Date().getFullYear()} Fairy Frills. All rights reserved.
              {/* Fairy dust particles */}
              {showDust && (
                <span key={dustKey} className="pointer-events-none absolute inset-0" aria-hidden="true">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute text-[8px]"
                      style={{
                        left: `${15 + i * 14}%`,
                        top: "-6px",
                        animation: `fairy-dust 0.6s ${i * 0.07}s ease-out forwards`,
                        color: "#E799AA",
                        opacity: 0,
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </span>
              )}
            </span>

            {/* Right sparkle */}
            <span
              className="absolute right-0 text-[#E799AA] opacity-40"
              style={{ animation: "footer-sparkle 2.8s 1.2s ease-in-out infinite" }}
              aria-hidden="true"
            >
              <StarIcon size={8} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
