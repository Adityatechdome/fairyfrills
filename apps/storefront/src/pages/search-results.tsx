import { useMemo, useEffect, useRef, useCallback } from "react"
import { useSearch, useLocation } from "@tanstack/react-router"
import ProductCard from "@/components/product-card"
import { useInfiniteProducts } from "@/lib/hooks/use-products"
import { useRegion } from "@/lib/hooks/use-regions"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import PageBanner from "@/components/page-banner"

const PRODUCTS_PER_PAGE = 20

const SearchResults = () => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const searchParams = useSearch({ from: "/$countryCode/search" }) as { q?: string }
  const query = searchParams.q?.trim() || ""

  const { data: region } = useRegion({ country_code: countryCode })

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteProducts({
    region_id: region?.id,
    limit: PRODUCTS_PER_PAGE,
    query_params: query ? { q: query } : {},
  })

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.products) ?? [],
    [data]
  )
  const totalCount = data?.pages[0]?.count ?? 0

  // IntersectionObserver sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersect])

  return (
    <>
      <PageBanner title={query ? `Search: "${query}"` : "Search"} />

      <div className="content-container py-8 md:py-12">
        {/* Result count */}
        {!isLoading && query && (
          <p className="text-sm text-[var(--color-text-light)] mb-6">
            {totalCount === 0
              ? `No products found for "${query}"`
              : `${totalCount} ${totalCount === 1 ? "product" : "products"} found for "${query}"`}
          </p>
        )}

        {/* Initial loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
                <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && products.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-2xl text-[var(--color-text)] mb-3">
              No products found
            </p>
            <p className="text-sm text-[var(--color-text-light)]">
              We couldn't find any products matching "{query}". Try a different search term.
            </p>
          </div>
        )}

        {/* No query entered */}
        {!isLoading && !query && (
          <div className="text-center py-16">
            <p className="text-sm text-[var(--color-text-light)]">
              Enter a search term to find products.
            </p>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <ProductCard key={product.id ?? index} product={product} />
              ))}
            </div>

            {/* Sentinel element — triggers next page fetch */}
            <div ref={sentinelRef} className="h-1" />

            {/* Loading more skeleton */}
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
                    <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
                    <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* End of results */}
            {!hasNextPage && products.length > 0 && (
              <p className="text-center text-xs text-[var(--color-text-light)] mt-8 pb-4">
                You've reached the end
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default SearchResults
