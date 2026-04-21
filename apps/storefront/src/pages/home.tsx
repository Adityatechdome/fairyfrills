import { useEffect } from "react"
import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useCategories } from "@/lib/hooks/use-categories"
import TopSellers from "@/components/top-sellers"
import ClientDiaries from "@/components/client-diaries"
import ClientFeedback from "@/components/client-feedback"
import ConfettiCelebration from "@/components/confetti-celebration"
import PromoPopup from "@/components/promo-popup"
import { VirtualTryOn } from "@/components/virtual-tryon"
import { HeroCarousel } from "@/components/hero-carousel"

/**
 * Scrolls to the #virtual-tryon section on the homepage.
 * If already on homepage, smooth-scrolls. Otherwise navigates to homepage
 * and uses sessionStorage to trigger the scroll after route change.
 */
export function scrollToVirtualTryon(countryCode: string, navigate?: ReturnType<typeof useNavigate>) {
  const target = document.getElementById("virtual-tryon")
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" })
  } else if (navigate) {
    sessionStorage.setItem("scrollToVirtualTryon", "1")
    navigate({ to: "/$countryCode", params: { countryCode } })
  } else {
    sessionStorage.setItem("scrollToVirtualTryon", "1")
    window.location.href = `/${countryCode}`
  }
}

// Decorative sparkle SVG for magical feel
const Sparkle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
  </svg>
)

const HeroCarouselWrapper = () => {
  const { data } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: () => sdk.client.fetch<any>("/store/hero-slides"),
    staleTime: 60000,
  })

  const slides = data?.slides || []

  if (slides.length === 0) return null

  return <HeroCarousel slides={slides} />
}

const MarqueeTicker = () => {
  const { data } = useQuery({
    queryKey: ["marquee"],
    queryFn: () => sdk.client.fetch<any>("/store/marquee"),
    staleTime: 60000,
  })

  const items = data?.marquee?.text_items || []
  if (items.length === 0) return null

  const repeated = [...items, ...items]

  return (
    <section className="bg-[var(--color-primary)] py-3 overflow-hidden">
      <div className="marquee-scroll flex items-center gap-6 flex-nowrap w-max">
        {repeated.map((item: string, i: number) => (
          <span key={i} className="font-serif text-white text-sm tracking-[0.2em] uppercase whitespace-nowrap flex items-center gap-6">
            {item}
            <span className="opacity-60">•</span>
          </span>
        ))}
      </div>
    </section>
  )
}

// Fallback images for existing categories until admin sets metadata.thumbnail
const CATEGORY_FALLBACKS: Record<string, { image: string; subtitle: string; tint: string }> = {
  "birthday-outfits": {
    image: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/birthday-outfits-01KMYVR9CTFCPT23WR1162KRXC.png",
    subtitle: "Sparkle on Your Special Day",
    tint: "rgba(224, 156, 255, 0.15)", // soft lavender
  },
  "mother-daughter-combos": {
    image: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/MOTHER-AND-DAUGHTER-CAMBO-01KJG60KYMDQ83AJWTK5VJ48Y7.jpg",
    subtitle: "Twinning is Winning",
    tint: "rgba(255, 182, 193, 0.15)", // blush pink
  },
  "seasonal": {
    image: "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/1-2--01KKBAP3THXJH949GWTY2W40BB.jpg",
    subtitle: "Light, Breezy & Beautiful",
    tint: "rgba(255, 215, 120, 0.15)", // golden warm
  },
  "themedresses": {
    image: "",
    subtitle: "Dress Your Dreams",
    tint: "rgba(186, 150, 255, 0.15)", // fairy purple
  },
}

const CategoryCard = ({
  cat,
  countryCode,
  isScrollable,
}: {
  cat: { id: string; name: string; handle: string; metadata?: Record<string, unknown> | null }
  countryCode: string
  isScrollable: boolean
}) => {
  const fallback = CATEGORY_FALLBACKS[cat.handle] || { image: "", subtitle: "", tint: "rgba(231, 153, 170, 0.15)" }
  const image = (cat.metadata?.thumbnail as string) || fallback.image
  const subtitle = (cat.metadata?.subtitle as string) || fallback.subtitle
  const tint = fallback.tint

  return (
    <Link
      to="/$countryCode/categories/$handle"
      params={{ countryCode, handle: cat.handle }}
      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary-50)] to-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(231,153,170,0.3),0_0_0_2px_rgba(231,153,170,0.4)] transition-all duration-500 ease-out block ${
        isScrollable ? "flex-shrink-0" : ""
      }`}
      style={{
        height: isScrollable ? "380px" : "400px",
        width: isScrollable ? "300px" : "100%",
      }}
    >
      {/* Background image with zoom effect */}
      {image ? (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={image}
            alt={cat.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-light)]" />
      )}

      {/* Color tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{ backgroundColor: tint }}
      />

      {/* Gradient overlay - deepens on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent group-hover:from-black/85 group-hover:via-black/40 transition-all duration-500" />

      {/* Top badge pill */}
      {subtitle && (
        <div className="absolute top-5 left-5 z-10">
          <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg">
            <p className="text-white text-xs italic font-light tracking-wide">{subtitle}</p>
          </div>
        </div>
      )}

      {/* Bottom text content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4 md:p-5">
        <h3 className="font-serif text-2xl md:text-3xl text-white font-bold leading-tight mb-3 drop-shadow-lg">
          {cat.name}
        </h3>

        {/* Shop Now button */}
        <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/40 text-white text-xs font-semibold tracking-wide transition-all duration-300 group-hover:bg-[var(--color-primary)] group-hover:border-[var(--color-primary)] group-hover:shadow-[0_4px_20px_rgba(231,153,170,0.5)] group-hover:scale-105">
          Shop Now
          <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </Link>
  )
}

// Floating particle animation component
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 6,
    size: 3 + Math.random() * 4,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float"
          style={{
            left: p.left,
            bottom: "-10px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          <Sparkle className={`text-[var(--color-primary)]`} style={{ width: p.size, height: p.size }} />
        </div>
      ))}
    </div>
  )
}

const FeaturedCategories = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const { data: categories } = useCategories({
    fields: "id,name,handle,description,metadata",
    queryParams: { parent_category_id: "null" },
  })

  const cats = categories || []

  if (cats.length === 0) return null

  // If 4 or fewer categories, center them. If 5+, use scrollable carousel
  const isScrollable = cats.length > 4

  return (
    <section className="relative py-16 md:py-24 bg-gradient-to-b from-white via-[#FFF8FA] to-white overflow-hidden">
      {/* Floating particle background */}
      <FloatingParticles />

      <div className="content-container relative z-10">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-eyebrow mb-3">OUR COLLECTIONS</p>
          <h2 className="heading-h2 mb-4">Shop by Category</h2>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
            <Sparkle className="text-[var(--color-primary)] w-4 h-4" />
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
          </div>
        </div>
      </div>

      {/* Category cards - centered grid for <=4, scrollable carousel for 5+ */}
      {isScrollable ? (
        <div className="relative">
          {/* Fade gradient on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div
            className="flex gap-6 md:gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-6 px-6 md:px-12"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {cats.map((cat) => (
              <div key={cat.id} className="snap-center">
                <CategoryCard cat={cat} countryCode={countryCode} isScrollable={true} />
              </div>
            ))}
          </div>

          {/* Hide scrollbar for webkit */}
          <style>{`
            .snap-x::-webkit-scrollbar { display: none; }
            @keyframes float {
              0% { transform: translateY(0) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
            .animate-float {
              animation: float linear infinite;
            }
          `}</style>
        </div>
      ) : (
        <div className="content-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
            {cats.map((cat) => (
              <CategoryCard key={cat.id} cat={cat} countryCode={countryCode} isScrollable={false} />
            ))}
          </div>
          
          {/* Animation styles */}
          <style>{`
            @keyframes float {
              0% { transform: translateY(0) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
            .animate-float {
              animation: float linear infinite;
            }
          `}</style>
        </div>
      )}
    </section>
  )
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-[var(--color-primary)]" : "text-gray-200"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
)

const Testimonials = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const { data } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => sdk.client.fetch<any>("/store/testimonials"),
    staleTime: 60000,
  })

  const testimonials = data?.testimonials || []
  if (testimonials.length === 0) return null

  return (
    <section className="bg-[var(--color-primary-50)] py-16">
      <div className="content-container">
        <h2 className="heading-h2 text-center mb-10">
          Stories of Our Customers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t: any) => (
            <div key={t.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <svg className="w-8 h-8 text-[var(--color-primary-light)] mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
              </svg>

              <p className="text-[var(--color-text-light)] text-sm leading-relaxed mb-4 italic">
                &ldquo;{t.review_text}&rdquo;
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--color-text)] font-medium text-sm">
                  {t.customer_name}
                </span>
                <StarRating rating={t.rating} />
              </div>

              {t.product && (
                <Link
                  to="/$countryCode/products/$handle"
                  params={{ countryCode, handle: t.product.handle }}
                  className="flex items-center gap-3 pt-4 border-t border-[var(--color-border-light)]"
                >
                  {t.product.thumbnail && (
                    <img
                      src={t.product.thumbnail}
                      alt={t.product.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                      {t.product.title}
                    </p>
                    <span className="text-xs text-[var(--color-primary)] font-medium">
                      View Dress
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Home = () => {
  // After navigating from another page, scroll to #virtual-tryon if flagged
  useEffect(() => {
    const flag = sessionStorage.getItem("scrollToVirtualTryon")
    if (!flag) return
    sessionStorage.removeItem("scrollToVirtualTryon")
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById("virtual-tryon")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      } else if (attempts < 15) {
        setTimeout(() => tryScroll(attempts + 1), 200)
      }
    }
    setTimeout(() => tryScroll(), 300)
  }, [])

  return (
    <div>
      <PromoPopup />
      <ConfettiCelebration />
      <HeroCarouselWrapper />
      <MarqueeTicker />
      <FeaturedCategories />
      <TopSellers />
      <ClientDiaries />
      <ClientFeedback />
      {/* <VirtualTryOn /> */}
      <Testimonials />
    </div>
  )
}

export default Home
