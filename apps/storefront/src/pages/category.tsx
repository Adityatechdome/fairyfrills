import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import Breadcrumb from "@/components/breadcrumb"
import ProductCard from "@/components/product-card"
import { usePaginatedProducts } from "@/lib/hooks/use-products"
import { useLoaderData } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { sdk } from "@/lib/utils/sdk"

type SortOption =
  | "popular"
  | "recent"
  | "price_high_low"
  | "price_low_high"
  | "a_z"
  | "z_a"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "recent", label: "Most Recent" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "a_z", label: "A to Z" },
  { value: "z_a", label: "Z to A" },
]

const PRODUCTS_PER_PAGE = 24

const getServerOrderParam = (sort: SortOption): string | undefined => {
  switch (sort) {
    case "recent":
      return "-created_at"
    case "a_z":
      return "title"
    case "z_a":
      return "-title"
    default:
      return undefined
  }
}

const getLowestPrice = (product: any): number => {
  const prices: number[] = []
  for (const variant of product.variants ?? []) {
    const cp = variant.calculated_price
    if (cp?.calculated_amount != null) {
      prices.push(cp.calculated_amount)
    }
    for (const price of variant.prices ?? []) {
      if (price.amount != null) prices.push(price.amount)
    }
  }
  return prices.length > 0 ? Math.min(...prices) : 0
}

const Category = () => {
  const { category, region, countryCode } = useLoaderData({
    from: "/$countryCode/categories/$handle",
  })

  const categoryId = category?.id
  const [sort, setSort] = useState<SortOption>("popular")
  const [page, setPage] = useState(1)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Reset state when category changes
  useEffect(() => {
    setSort("popular")
    setPage(1)
    setAllProducts([])
    setHasMore(true)
  }, [categoryId])

  // Reset state when sort changes
  useEffect(() => {
    setPage(1)
    // Don't clear allProducts immediately - let the data fetch complete first
    // This prevents the "No products found" flash
    setHasMore(true)
  }, [sort])

  const serverOrder = getServerOrderParam(sort)

  const {
    data,
    isLoading,
    isFetching,
    isPending,
  } = usePaginatedProducts({
    region_id: region?.id,
    page,
    limit: PRODUCTS_PER_PAGE,
    query_params: {
      category_id: categoryId ? [categoryId] : undefined,
      ...(serverOrder ? { order: serverOrder } : {}),
    },
  })

  const products = data?.products ?? []
  const totalCount = data?.count ?? 0

  const { data: topSellersData } = useQuery({
    queryKey: ["top-sellers-rank"],
    queryFn: async () => {
      const res = await sdk.client.fetch<{ products: { id: string }[] }>(
        "/store/top-sellers"
      )
      return res.products.map((p) => p.id)
    },
    enabled: sort === "popular",
    staleTime: 5 * 60 * 1000,
  })

  // Append new products to the list when data changes
  useEffect(() => {
    // Only process when we have actual data (not loading, not pending)
    if (!isLoading && !isPending && data) {
      if (products.length > 0) {
        setAllProducts((prev) => {
          // If page 1, replace everything (fresh start after sort/category change)
          if (page === 1) {
            return products
          }
          // For subsequent pages, prevent duplicates and append
          const newProducts = products.filter(
            (p) => !prev.some((existing) => existing.id === p.id)
          )
          return [...prev, ...newProducts]
        })
        // Check if we have all products
        if (page * PRODUCTS_PER_PAGE >= totalCount) {
          setHasMore(false)
        }
      } else if (page === 1) {
        // If first page has no products, set empty
        setAllProducts([])
        setHasMore(false)
      }
    }
  }, [products, totalCount, page, isLoading, isPending, data])

  const sortedProducts = useMemo(() => {
    if (sort === "popular") {
      const rankedIds = topSellersData ?? []
      const ranked = rankedIds
        .map((id) => allProducts.find((p) => p.id === id))
        .filter(Boolean) as typeof allProducts
      const rest = allProducts.filter((p) => !rankedIds.includes(p.id))
      return [...ranked, ...rest]
    }

    if (sort === "price_high_low") {
      return [...allProducts].sort((a, b) => getLowestPrice(b) - getLowestPrice(a))
    }

    if (sort === "price_low_high") {
      return [...allProducts].sort((a, b) => getLowestPrice(a) - getLowestPrice(b))
    }

    return allProducts
  }, [allProducts, sort, topSellersData])

  // Load next page
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore && allProducts.length < totalCount) {
      setPage((prev) => prev + 1)
    }
  }, [isFetching, hasMore, allProducts.length, totalCount])

  // IntersectionObserver to detect when user scrolls to bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting) {
          loadMore()
        }
      },
      {
        root: null,
        rootMargin: "200px", // Trigger 200px before reaching the bottom
        threshold: 0,
      }
    )

    const currentLoader = loaderRef.current
    if (currentLoader) {
      observer.observe(currentLoader)
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader)
      }
    }
  }, [loadMore])

  // Show loading skeleton when: truly loading (no placeholder data) AND no products accumulated yet
  // With placeholderData enabled, isLoading/isPending are often false even when refetching
  // So we check: are we on page 1, fetching, and have no products to show?
  const showInitialLoading = page === 1 && allProducts.length === 0 && (isLoading || isFetching)

  return (
    <div className="content-container py-8 md:py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/$countryCode", params: { countryCode } },
          { label: category?.name || "Category" },
        ]}
      />
      <div className="text-center mb-8">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--color-text)] tracking-wide whitespace-nowrap">
          {category?.name || "Category"}
        </h1>
        {category?.description && (
          <p className="mt-2 text-[var(--color-text-light)] text-sm max-w-lg mx-auto">
            {category.description}
          </p>
        )}
      </div>

      {!showInitialLoading && (totalCount > 0 || sortedProducts.length > 0) && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[var(--color-text-light)]">
            {totalCount} {totalCount === 1 ? "product" : "products"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-light)] whitespace-nowrap">
              Sort
            </span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortOption)
              }}
              className="text-xs border border-[var(--color-border-light)] rounded-full h-7 pl-3 pr-7 bg-white text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              style={{
                appearance: "none",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23aaa' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 10px center",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showInitialLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-lg" />
              <div className="mt-3 h-4 bg-gray-200 rounded w-3/4" />
              <div className="mt-2 h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 && !isFetching ? (
        <div className="text-center text-[var(--color-text-light)] py-12">
          No products found in this category yet.
        </div>
      ) : (
        <>
          {/* Products grid with loading overlay */}
          <div className="relative">
            {/* Loading overlay when refetching (sort change) */}
            {isFetching && page === 1 && allProducts.length > 0 && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="animate-spin h-8 w-8 text-[var(--color-primary)]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm text-[var(--color-text-light)]">Loading...</span>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.id ?? index} product={product} />
              ))}
            </div>
          </div>

          {/* Loading spinner or end message */}
          <div ref={loaderRef} className="flex justify-center items-center py-8">
            {isFetching && hasMore && page > 1 ? (
              <div className="flex items-center gap-2 text-[var(--color-text-light)] text-sm">
                <svg
                  className="animate-spin h-5 w-5 text-[var(--color-primary)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading more products...
              </div>
            ) : !hasMore && sortedProducts.length > 0 ? (
              <div className="text-[var(--color-text-light)] text-sm">
                You've seen all products
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}

export default Category
