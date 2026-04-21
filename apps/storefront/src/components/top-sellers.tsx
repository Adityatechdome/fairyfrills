import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { getProductPrice } from "@/lib/utils/price"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import { useState, useRef } from "react"
import type SwiperType from "swiper"
import "swiper/css"
import "swiper/css/navigation"

enum BadgeType {
  NEW = "NEW",
  EXCLUSIVE = "EXCLUSIVE",
  TRENDING = "TRENDING",
  BESTSELLER = "BESTSELLER",
  VIRAL = "VIRAL",
  HOT = "HOT",
  LIMITED_EDITION = "LIMITED_EDITION",
  SOLD_OUT = "SOLD_OUT",
}

type BadgeConfig = {
  color: string
  bgColor: string
  label: string
}

const BADGE_CONFIGS: Record<BadgeType, BadgeConfig> = {
  [BadgeType.NEW]: { color: "#fff", bgColor: "var(--color-primary)", label: "NEW" },
  [BadgeType.EXCLUSIVE]: { color: "#fff", bgColor: "#a21e5c", label: "EXCLUSIVE" },
  [BadgeType.TRENDING]: { color: "#fff", bgColor: "#7c3aed", label: "TRENDING" },
  [BadgeType.BESTSELLER]: { color: "#000", bgColor: "#fbbf24", label: "BESTSELLER" },
  [BadgeType.VIRAL]: { color: "#fff", bgColor: "#f97316", label: "VIRAL" },
  [BadgeType.HOT]: { color: "#fff", bgColor: "#dc2626", label: "HOT" },
  [BadgeType.LIMITED_EDITION]: { color: "#fff", bgColor: "#7f1d1d", label: "LIMITED EDITION" },
  [BadgeType.SOLD_OUT]: { color: "#fff", bgColor: "#6b7280", label: "SOLD OUT" },
}

const TopSellers = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const { data: productsData } = useQuery({
    queryKey: ["top-sellers"],
    queryFn: () => sdk.client.fetch<any>("/store/top-sellers"),
    staleTime: 60000,
  })

  const { data: settingsData } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => sdk.client.fetch<any>("/store/site-settings"),
    staleTime: 60000,
  })

  const products = productsData?.products || []
  const settings = settingsData || {}
  
  if (products.length === 0) return null

  const subheading = settings.top_sellers_subheading || "OUR BESTSELLERS"
  const heading = settings.top_sellers_heading || "Top Sellers"
  const useCarousel = products.length > 4

  return (
    <section className="py-16 bg-white relative">
      <div className="content-container">
        <div className="text-center mb-12">
          <p className="text-eyebrow mb-3">
            {subheading}
          </p>
          <h2 className="heading-h2 mb-4">
            {heading}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
            <svg className="text-[var(--color-primary)] w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
            </svg>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
          </div>
        </div>

        {useCarousel ? (
          <div className="relative group/section">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            
            <Swiper
              modules={[Autoplay, Navigation]}
              onSwiper={setSwiperRef}
              slidesPerView={1}
              spaceBetween={24}
              loop={true}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                prevEl: prevRef.current,
                nextEl: nextRef.current,
              }}
              onBeforeInit={(swiper) => {
                if (swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
                  swiper.params.navigation.prevEl = prevRef.current
                  swiper.params.navigation.nextEl = nextRef.current
                }
              }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 30 },
              }}
              className="!overflow-visible"
            >
              {products.map((product: any) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} countryCode={countryCode} />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              ref={prevRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-300"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              aria-label="Previous"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              ref={nextRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover/section:opacity-100 transition-all duration-300"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              aria-label="Next"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} countryCode={countryCode} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

const ProductCard = ({ product, countryCode }: { product: any; countryCode: string }) => {
  const [showButtons, setShowButtons] = useState(false)
  
  const imageUrl = product.thumbnail || product.images?.[0]?.url
  const { cheapestPrice } = getProductPrice({ product })
  const hasSalePrice = cheapestPrice?.price_type === "sale"

  const topSellerData = product.top_seller || {}
  const badge = topSellerData.badge_type && topSellerData.badge_visible 
    ? BADGE_CONFIGS[topSellerData.badge_type as BadgeType] 
    : null

  const compareAtPrice = topSellerData.compare_at_price
  const discountPercentage = compareAtPrice && cheapestPrice?.calculated_price && typeof cheapestPrice.calculated_price === "number"
    ? Math.round(((compareAtPrice - cheapestPrice.calculated_price) / compareAtPrice) * 100)
    : null

  return (
    <div
      className="group flex flex-col transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500" style={{ boxShadow: showButtons ? "0 20px 50px rgba(231, 153, 170, 0.3)" : "0 4px 15px rgba(0, 0, 0, 0.08)" }}>
        {badge && (
          <span 
            className="absolute top-3 left-3 text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase z-10 shadow-sm"
            style={{ backgroundColor: badge.bgColor, color: badge.color }}
          >
            {badge.label}
          </span>
        )}

        <Link
          to="/$countryCode/products/$handle"
          params={{ countryCode, handle: product.handle }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-gray-400">No image</span>
            </div>
          )}
        </Link>

        <div 
          className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4 transition-all duration-500 transform"
          style={{
            transform: showButtons ? "translateY(0)" : "translateY(calc(100% + 20px))",
            opacity: showButtons ? 1 : 0
          }}
        >
          <Link
            to="/$countryCode/products/$handle"
            params={{ countryCode, handle: product.handle }}
            className="w-full px-6 py-3 rounded-full font-semibold text-sm text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ backgroundColor: "#a21e5c" }}
          >
            Buy Now
          </Link>
          <Link
            to="/$countryCode/products/$handle"
            params={{ countryCode, handle: product.handle }}
            className="text-xs font-medium transition-colors duration-300"
            style={{ color: "var(--color-primary)" }}
          >
            Quick View
          </Link>
        </div>
      </div>

      <Link
        to="/$countryCode/products/$handle"
        params={{ countryCode, handle: product.handle }}
        className="mt-4 text-center"
      >
        <h3 className="font-serif text-base font-semibold mb-2 line-clamp-1 transition-colors duration-300" style={{ color: "var(--color-heading-deep)" }}>
          {product.title}
        </h3>
        
        {cheapestPrice && (
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency: cheapestPrice.currency_code }).format(compareAtPrice)}
              </span>
            )}
            <span className="text-lg font-bold" style={{ color: "var(--color-heading-deep)" }}>
              {typeof cheapestPrice.calculated_price === "number"
                ? new Intl.NumberFormat("en-IN", { style: "currency", currency: cheapestPrice.currency_code }).format(cheapestPrice.calculated_price)
                : cheapestPrice.calculated_price}
            </span>
            {discountPercentage && discountPercentage > 0 && (
              <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-primary-50)", color: "var(--color-primary)" }}>
                {discountPercentage}% off
              </span>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}

export default TopSellers
