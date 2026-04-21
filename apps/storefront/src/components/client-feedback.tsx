import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { useState, useCallback, useEffect, useRef } from "react"

type FeedbackEntry = {
  id: string
  image_url: string
  customer_name: string
  city: string | null
  platform: "whatsapp" | "instagram"
  rating: number
  caption: string | null
  sort_order: number
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="w-4 h-4"
          fill={i < stars ? "#E799AA" : "none"}
          stroke={i < stars ? "#E799AA" : "#d1a0af"}
          strokeWidth={i < stars ? 0 : 1.5}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

const VerifiedBadge = () => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-white"
    style={{ background: "linear-gradient(135deg, #E799AA, #c0607a)" }}
  >
    <svg viewBox="0 0 16 16" className="w-2.5 h-2.5" fill="currentColor">
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.707 6.207l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L7 8.086l3.293-3.293a1 1 0 011.414 1.414z" />
    </svg>
    VERIFIED
  </span>
)

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const ClientFeedback = () => {
  const { data } = useQuery({
    queryKey: ["client-feedback"],
    queryFn: () =>
      sdk.client.fetch<{ entries: FeedbackEntry[] }>("/store/client-feedback"),
    staleTime: 60000,
  })

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const entries = data?.entries || []

  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    if (entries.length === 0) return
    updateScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", updateScrollButtons)
      return () => container.removeEventListener("scroll", updateScrollButtons)
    }
  }, [entries, updateScrollButtons])

  if (entries.length === 0) return null

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = container.querySelector(".feedback-card")?.clientWidth || 300
    const scrollAmount = cardWidth + 24
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #fdf6f0 0%, #fef0f3 50%, #fdf8f5 100%)" }}
    >
      {/* Subtle decorative blobs */}
      <div
        className="absolute top-0 left-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(ellipse, #E799AA 0%, transparent 70%)" }}
      />

      <div className="content-container relative z-10">
        {/* Section heading */}
        <div className="text-center mb-12">
          <p className="text-eyebrow mb-3">
            CLIENT FEEDBACK
          </p>
          <h2 className="heading-h2 mb-4">
            Love from our Customers
          </h2>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
            <svg className="text-[var(--color-primary)] w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
            </svg>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
          </div>
        </div>

        {/* Carousel container with fade gradients */}
        <div className="relative">
          {/* Left fade gradient */}
          {canScrollLeft && (
            <div
              className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to right, rgba(253,246,240,1), rgba(253,246,240,0))",
              }}
            />
          )}

          {/* Right fade gradient */}
          {canScrollRight && (
            <div
              className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
              style={{
                background: "linear-gradient(to left, rgba(253,246,240,1), rgba(253,246,240,0))",
              }}
            />
          )}

          {/* Left arrow button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
              style={{ color: "#E799AA" }}
              aria-label="Scroll left"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Right arrow button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
              style={{ color: "#E799AA" }}
              aria-label="Scroll right"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}

          {/* Scrollable carousel */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            {entries.map((entry, i) => (
              <FeedbackCard
                key={entry.id ?? i}
                entry={entry}
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <FeedbackLightbox
          entries={entries}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  )
}

const FeedbackCard = ({
  entry,
  onClick,
}: {
  entry: FeedbackEntry
  onClick: () => void
}) => {
  const initials = getInitials(entry.customer_name)
  const rating = entry.rating ?? 5

  return (
    <div
      className="feedback-card group cursor-pointer rounded-2xl overflow-hidden flex flex-col transition-all duration-300 snap-start shrink-0"
      style={{
        background: "white",
        boxShadow: "0 2px 16px rgba(45,16,32,0.07), 0 0 0 1px rgba(231,153,170,0.15)",
        width: "calc(25% - 18px)",
        minWidth: "280px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(231,153,170,0.25), 0 0 0 1px rgba(231,153,170,0.2)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(45,16,32,0.07), 0 0 0 1px rgba(231,153,170,0.15)"
      }}
      onClick={onClick}
    >
      {/* Image area - full raw screenshot without cropping */}
      <div className="relative bg-gray-50">
        <img
          src={entry.image_url}
          alt={`Feedback from ${entry.customer_name}`}
          className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>

      {/* Content - compact height */}
      <div className="p-3 flex flex-col">
        <div className="mb-2">
          <StarRating rating={rating} />
        </div>

        {entry.caption && (
          <p
            className="text-xs leading-relaxed mb-2 line-clamp-2"
            style={{ color: "var(--color-body)", fontStyle: "italic" }}
          >
            &ldquo;{entry.caption}&rdquo;
          </p>
        )}

        {/* Reviewer info */}
        <div className="flex items-center gap-2 pt-2 mt-auto" style={{ borderTop: "1px solid rgba(231,153,170,0.2)" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg, #E799AA, #c0607a)" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: "var(--color-heading)" }}>
              {entry.customer_name}
            </p>
            {entry.city && (
              <p className="text-xs" style={{ color: "var(--color-body-muted)" }}>
                {entry.city}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FeedbackLightbox = ({
  entries,
  currentIndex,
  onClose,
  onNavigate,
}: {
  entries: FeedbackEntry[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) => {
  const entry = entries[currentIndex]
  const initials = getInitials(entry.customer_name)
  const rating = entry.rating ?? 5

  const goNext = useCallback(() => {
    onNavigate((currentIndex + 1) % entries.length)
  }, [currentIndex, entries.length, onNavigate])

  const goPrev = useCallback(() => {
    onNavigate((currentIndex - 1 + entries.length) % entries.length)
  }, [currentIndex, entries.length, onNavigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") goNext()
      if (e.key === "ArrowLeft") goPrev()
    }
    document.addEventListener("keydown", handler)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handler)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, goNext, goPrev])

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {entries.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext() }}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative max-w-2xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "white" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img
            src={entry.image_url}
            alt={`Feedback from ${entry.customer_name}`}
            className="w-full h-auto"
          />
          <div className="absolute top-3 right-3">
            <VerifiedBadge />
          </div>
        </div>
        <div className="p-5">
          <StarRating rating={rating} />
          {entry.caption && (
            <p className="mt-3 text-sm leading-relaxed italic" style={{ color: "var(--color-body)" }}>
              &ldquo;{entry.caption}&rdquo;
            </p>
          )}
          <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: "1px solid rgba(231,153,170,0.2)" }}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "linear-gradient(135deg, #E799AA, #c0607a)" }}
            >
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-heading)" }}>
                {entry.customer_name}
              </p>
              {entry.city && (
                <p className="text-xs" style={{ color: "var(--color-body-muted)" }}>{entry.city}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-white/40 text-sm">{currentIndex + 1} / {entries.length}</span>
      </div>
    </div>
  )
}

export default ClientFeedback
