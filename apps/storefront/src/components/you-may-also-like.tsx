import { useRelatedProducts } from "@/lib/hooks/use-products"
import { getPriceInfoWithDiscount } from "@/lib/utils/price"
import { HttpTypes } from "@medusajs/types"
import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useRef, useEffect, useCallback, useState } from "react"

type Props = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function YouMayAlsoLike({ product, region }: Props) {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  // Use first category for filtering
  const primaryCategoryId = product.categories?.[0]?.id

  const { data: relatedProducts, isLoading } = useRelatedProducts({
    product_id: product.id ?? "",
    region_id: region.id,
    category_id: primaryCategoryId,
  })

  // Sort products to prioritize discounted products first
  const sortedProducts = relatedProducts?.slice().sort((a, b) => {
    const priceInfoA = getPriceInfoWithDiscount(a)
    const priceInfoB = getPriceInfoWithDiscount(b)
    
    const discountA = priceInfoA?.discountPercentage ?? 0
    const discountB = priceInfoB?.discountPercentage ?? 0
    
    // Products with discount come first (higher discount percentage first)
    if (discountA > 0 && discountB === 0) return -1
    if (discountA === 0 && discountB > 0) return 1
    if (discountA > 0 && discountB > 0) return discountB - discountA
    
    // Both have no discount, maintain original order
    return 0
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const animFrameRef = useRef<number | null>(null)
  const [isReady, setIsReady] = useState(false)

  const startAutoScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const SPEED = 0.6 // px per frame — gentle and smooth

    const tick = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += SPEED

        // When we've scrolled to the halfway point (clone start), jump back silently
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0
        }
      }
      animFrameRef.current = requestAnimationFrame(tick)
    }

    animFrameRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (sortedProducts && sortedProducts.length > 0) {
      setIsReady(true)
    }
  }, [sortedProducts])

  useEffect(() => {
    if (!isReady) return

    startAutoScroll()
    return () => {
      if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isReady, startAutoScroll])

  if (isLoading) {
    return (
      <section className="py-10 px-4 md:px-8 border-t border-[var(--color-border-light)]">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-6">
          You May Also Like
          <span className="ml-2 text-[var(--color-primary)]">✦</span>
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[200px] bg-gray-100 rounded-2xl animate-pulse h-[320px] flex-shrink-0" />
          ))}
        </div>
      </section>
    )
  }

  if (!sortedProducts || sortedProducts.length === 0) return null

  // Duplicate list for seamless infinite loop
  const items = sortedProducts.length < 5
    ? [...sortedProducts, ...sortedProducts, ...sortedProducts]
    : [...sortedProducts, ...sortedProducts]

  return (
    <section className="py-10 border-t border-[var(--color-border-light)]">
      <div className="px-4 md:px-8 mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
          You May Also Like
          <span className="ml-2 text-[var(--color-primary)]">✦</span>
        </h2>
        {product.categories?.[0]?.name && (
          <p className="text-sm text-[var(--color-text-light)] mt-1">
            More from {product.categories[0].name}
          </p>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 md:px-8 pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseEnter={() => { pausedRef.current = true }}
        onMouseLeave={() => { pausedRef.current = false }}
        onTouchStart={() => { pausedRef.current = true }}
        onTouchEnd={() => { pausedRef.current = false }}
      >
        <style>{`
          .ymal-scroll::-webkit-scrollbar { display: none; }
          div[data-ymal]::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((rp, idx) => {
          const priceInfo = getPriceInfoWithDiscount(rp)
          const image = rp.thumbnail || rp.images?.[0]?.url

          return (
            <Link
              key={`${rp.id ?? rp.handle}-${idx}`}
              to="/$countryCode/products/$handle"
              params={{ countryCode, handle: rp.handle ?? "" }}
              className="group flex-shrink-0 w-[180px] md:w-[220px] flex flex-col bg-white rounded-2xl overflow-hidden border border-[var(--color-border-light)] hover:border-[var(--color-primary)] hover:shadow-lg transition-all duration-200"
              onClick={() => { pausedRef.current = false }}
            >
              {/* Image */}
              <div className="relative w-full aspect-[3/4] bg-[#fdf5f7] overflow-hidden">
                {image ? (
                  <img
                    src={image}
                    alt={rp.title ?? ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#fdf5f7]">
                    <span className="text-3xl text-[var(--color-primary-light)]">&#10041;</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <p className="font-serif text-sm font-semibold text-[var(--color-text)] leading-snug line-clamp-2">
                  {rp.title}
                </p>

                {priceInfo ? (
                  <div className="flex flex-col gap-0.5 mt-auto">
                    <span className="text-sm font-bold text-[var(--color-text)]">
                      {priceInfo.realFormatted}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {priceInfo.strikethroughFormatted && (
                        <span className="text-xs text-gray-400 line-through">
                          {priceInfo.strikethroughFormatted}
                        </span>
                      )}
                      {priceInfo.discountPercentage > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap">
                          {priceInfo.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
