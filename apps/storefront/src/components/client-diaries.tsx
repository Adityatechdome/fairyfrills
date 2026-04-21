import { sdk } from "@/lib/utils/sdk"
import { useQuery } from "@tanstack/react-query"
import { useState, useCallback, useEffect, useRef } from "react"

type DiaryEntry = {
  id: string
  image_url: string
  title: string | null
  caption: string | null
  sort_order: number
}

const INSTAGRAM_HANDLE = "@fairyfrillsai"

const SocialIcon = ({
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
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-out"
      style={{
        color: hovered ? "#E799AA" : "rgba(255,255,255,0.8)",
        background: hovered ? "rgba(231,153,170,0.15)" : "rgba(255,255,255,0.05)",
      }}
    >
      {children}
    </a>
  )
}

const ClientDiaries = () => {
  const { data } = useQuery({
    queryKey: ["client-diaries"],
    queryFn: () =>
      sdk.client.fetch<{ entries: DiaryEntry[] }>("/store/client-diaries"),
    staleTime: 60000,
  })

  const { data: footerData } = useQuery({
    queryKey: ["footer-content"],
    queryFn: () => sdk.client.fetch<any>("/store/footer"),
    staleTime: 60000,
  })

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const entries = data?.entries || []
  const footer = footerData?.footer
  if (entries.length === 0) return null

  return (
    <section
      className="py-16 md:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0a0f 0%, #2d1020 40%, #1c1218 100%)" }}
    >
      {/* Subtle background texture orbs */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #E799AA 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-8 pointer-events-none"
        style={{ background: "radial-gradient(circle, #c0607a 0%, transparent 70%)", transform: "translate(-30%, 30%)" }}
      />

      <div className="content-container relative z-10">
        {/* Section heading */}
        <div className="text-center mb-10 md:mb-12">
          <p className="text-eyebrow-dark-bg mb-3">
            Real Moments
          </p>
          <h2 className="heading-h2-dark mb-3">
            Client Diaries
          </h2>
          <p className="text-sm md:text-base" style={{ color: "var(--color-body-dark-bg)" }}>
            Stories from our fairy frills family
          </p>
        </div>

        {/* Horizontal scroll row */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {entries.map((entry, i) => (
            <DiaryCard
              key={entry.id ?? i}
              entry={entry}
              onClick={() => setLightboxIndex(i)}
            />
          ))}
        </div>

        {/* Social Media CTA */}
        <div className="flex justify-center mt-10">
          <div
            className="inline-flex items-center gap-4 px-7 py-3 rounded-full border text-sm font-medium"
            style={{
              borderColor: "rgba(231,153,170,0.5)",
              color: "white",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="font-medium">Follow us</span>
            <div className="flex items-center gap-2">
              {footer?.instagram_url && (
                <SocialIcon href={footer.instagram_url} label="Instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </SocialIcon>
              )}
              {footer?.youtube_url && (
                <SocialIcon href={footer.youtube_url} label="YouTube">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </SocialIcon>
              )}
              {footer?.facebook_url && (
                <SocialIcon href={footer.facebook_url} label="Facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </SocialIcon>
              )}
              {footer?.twitter_url && (
                <SocialIcon href={footer.twitter_url} label="Twitter">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
              )}
              {footer?.pinterest_url && (
                <SocialIcon href={footer.pinterest_url} label="Pinterest">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </SocialIcon>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          entries={entries}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  )
}

const DiaryCard = ({
  entry,
  onClick,
}: {
  entry: DiaryEntry
  onClick: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className="group shrink-0 snap-start cursor-pointer text-left"
      style={{ width: "clamp(200px, 22vw, 260px)" }}
    >
      {/* Image frame */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          aspectRatio: "3/4",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <img
          src={entry.image_url}
          alt={entry.title || "Client photo"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Dark gradient overlay at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)",
          }}
        />
        {/* Instagram handle overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="white" opacity={0.8}>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          <span className="text-white/80 text-[11px] font-medium">{INSTAGRAM_HANDLE}</span>
        </div>
        {/* Hover shine */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(231,153,170,0.12) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Title below image */}
      {entry.title && (
        <p className="mt-3 text-white text-sm font-medium leading-snug px-0.5">
          {entry.title}
        </p>
      )}
    </button>
  )
}

const Lightbox = ({
  entries,
  currentIndex,
  onClose,
  onNavigate,
}: {
  entries: DiaryEntry[]
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}) => {
  const entry = entries[currentIndex]

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
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
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
        className="relative max-w-3xl max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <img
            src={entry.image_url}
            alt={entry.title || "Client photo"}
            className="max-h-[70vh] w-auto mx-auto object-contain"
          />
          {(entry.title || entry.caption) && (
            <div
              className="px-5 py-4"
              style={{ background: "rgba(26,10,15,0.95)" }}
            >
              {entry.title && (
                <p className="text-white font-medium text-sm md:text-base">{entry.title}</p>
              )}
              {entry.caption && (
                <p className="text-white/60 text-xs md:text-sm mt-1">{entry.caption}</p>
              )}
            </div>
          )}
        </div>
        <div className="text-center mt-3">
          <span className="text-white/40 text-sm">{currentIndex + 1} / {entries.length}</span>
        </div>
      </div>
    </div>
  )
}

export default ClientDiaries
