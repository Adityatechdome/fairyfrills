import { ChevronLeft, ChevronRight, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { memo, useCallback, useEffect, useRef, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Navigation } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

// Lightbox with pinch-to-zoom for mobile
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: HttpTypes.StoreProductImage[]
  startIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLDivElement>(null)

  const lastTouchDistRef = useRef<number | null>(null)
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null)
  const isPanningRef = useRef(false)
  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const resetZoom = () => {
    setScale(1)
    setTranslate({ x: 0, y: 0 })
  }

  const goTo = (idx: number) => {
    resetZoom()
    setCurrentIndex((idx + images.length) % images.length)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      lastTouchDistRef.current = Math.hypot(dx, dy)
      lastTouchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
      isPanningRef.current = false
    } else if (e.touches.length === 1 && scale > 1) {
      isPanningRef.current = true
      panStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        tx: translate.x,
        ty: translate.y,
      }
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && lastTouchDistRef.current !== null) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const newDist = Math.hypot(dx, dy)
      const delta = newDist / lastTouchDistRef.current
      setScale((prev) => Math.min(Math.max(prev * delta, 1), 4))
      lastTouchDistRef.current = newDist
    } else if (e.touches.length === 1 && isPanningRef.current && panStartRef.current) {
      const dx = e.touches[0].clientX - panStartRef.current.x
      const dy = e.touches[0].clientY - panStartRef.current.y
      setTranslate({ x: panStartRef.current.tx + dx, y: panStartRef.current.ty + dy })
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistRef.current = null
    lastTouchCenterRef.current = null
    isPanningRef.current = false
    panStartRef.current = null
    setScale((prev) => {
      if (prev < 1.05) {
        setTranslate({ x: 0, y: 0 })
        return 1
      }
      return prev
    })
  }

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetZoom()
    } else {
      setScale(2.5)
    }
  }

  const image = images[currentIndex]

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Close lightbox"
      >
        <XMark className="text-white" />
      </button>

      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      <div
        ref={imgRef}
        className="relative w-full h-full flex items-center justify-center select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: "none" }}
      >
        {image?.url && (
          <img
            src={image.url}
            alt={`Product image ${currentIndex + 1}`}
            draggable={false}
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              transition: scale === 1 ? "transform 0.2s ease" : "none",
              maxWidth: "100vw",
              maxHeight: "100vh",
              objectFit: "contain",
              userSelect: "none",
              cursor: scale > 1 ? "grab" : "zoom-in",
            }}
          />
        )}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo(currentIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="text-white" />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.id ?? idx}
              onClick={() => goTo(idx)}
              className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              {img.url && (
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-xs pointer-events-none md:hidden whitespace-nowrap">
        Pinch to zoom · Double-tap to toggle
      </p>
    </div>
  )
}

const ZOOM_SCALE = 2.5

function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [origin, setOrigin] = useState("50% 50%")

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin(`${x}% ${y}%`)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-zoom-in"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-cover select-none pointer-events-none"
        style={{
          transformOrigin: origin,
          transform: isHovering ? `scale(${ZOOM_SCALE})` : "scale(1)",
          transition: isHovering ? "transform 0.1s ease-out" : "transform 0.25s ease-out",
          willChange: "transform",
        }}
      />

      {!isHovering && (
        <div className="absolute bottom-3 left-3 z-10 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none select-none">
          Hover to zoom
        </div>
      )}
    </div>
  )
}

const ImageGallery = memo(function ImageGallery({ images }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(hover: none) and (pointer: coarse)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const goToPrev = useCallback(() => { swiperRef.current?.slidePrev() }, [])
  const goToNext = useCallback(() => { swiperRef.current?.slideNext() }, [])
  const goToSlide = useCallback((index: number) => { swiperRef.current?.slideToLoop(index) }, [])

  const handleImageClick = useCallback(() => {
    if (isMobile) setLightboxOpen(true)
  }, [isMobile])

  if (images.length === 0) return null

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Main image */}
        <div className="relative rounded-lg bg-[var(--color-primary-50)] overflow-hidden">
          <Swiper
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={images.length > 1}
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="aspect-[4/5] w-full rounded-lg"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.id ?? index}>
                {!!image.url && (
                  <div
                    className="w-full h-full"
                    onClick={handleImageClick}
                    style={{ cursor: isMobile ? "zoom-in" : undefined }}
                  >
                    {isMobile ? (
                      <img
                        src={image.url}
                        className="w-full h-full object-cover"
                        alt={index === 0 ? "Main product image" : `Product image ${index + 1}`}
                        loading={index <= 1 ? "eager" : "lazy"}
                        fetchPriority={index === 0 ? "high" : undefined}
                        draggable={false}
                      />
                    ) : (
                      <ZoomImage
                        src={image.url}
                        alt={index === 0 ? "Main product image" : `Product image ${index + 1}`}
                      />
                    )}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {images.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4 text-[var(--color-text)]" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4 text-[var(--color-text)]" />
              </button>

              <div className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}

          {isMobile && (
            <div className="absolute bottom-3 left-3 z-10 bg-black/40 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
              Tap to view
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.map((image, index) => (
              <button
                key={image.id ?? index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  activeIndex === index
                    ? "border-[var(--color-primary)] opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                {!!image.url && (
                  <img
                    src={image.url}
                    className="w-full h-full object-cover"
                    alt={`Thumbnail ${index + 1}`}
                    loading="lazy"
                    draggable={false}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          startIndex={activeIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
})

ImageGallery.displayName = "ImageGallery"

export { ImageGallery }
export default ImageGallery
