import { useState, useEffect } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

// Decorative sparkle SVG for magical feel
const Sparkle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0 L13.5 10.5 L24 12 L13.5 13.5 L12 24 L10.5 13.5 L0 12 L10.5 10.5 Z" />
  </svg>
)

type TextPosition = "top-left" | "top-center" | "top-right" | "middle-left" | "middle-center" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right"

interface HeroSlide {
  id: string
  background_image_url: string
  mobile_background_image_url?: string | null
  badge_text?: string | null
  heading?: string | null
  highlight_text?: string | null
  subheading?: string | null
  heading_color?: string | null
  highlight_color?: string | null
  subheading_color?: string | null
  badge_text_color?: string | null
  primary_button_text_color?: string | null
  secondary_button_text_color?: string | null
  stats_text_color?: string | null
  primary_button_label?: string | null
  primary_button_link?: string | null
  secondary_button_label?: string | null
  secondary_button_link?: string | null
  stat_1_value?: string | null
  stat_1_label?: string | null
  stat_2_value?: string | null
  stat_2_label?: string | null
  stat_3_value?: string | null
  stat_3_label?: string | null
  text_position: TextPosition
  mobile_text_position?: TextPosition | null
  sort_order: number
  is_active: boolean
}

interface HeroCarouselProps {
  slides: HeroSlide[]
}

export const HeroCarousel = ({ slides }: HeroCarouselProps) => {
  const location = useLocation()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) return null

  const currentSlide = slides[currentIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const primaryLink = currentSlide.primary_button_link?.startsWith("/")
    ? `/${countryCode}${currentSlide.primary_button_link}`
    : currentSlide.primary_button_link || `/${countryCode}/categories/birthday-outfits`

  const secondaryLink = currentSlide.secondary_button_link?.startsWith("/")
    ? `/${countryCode}${currentSlide.secondary_button_link}`
    : currentSlide.secondary_button_link || `/${countryCode}/virtual-try-on`

  // Map 9-point grid position to Tailwind classes
  const getPositionClasses = (position: TextPosition, isMobile: boolean) => {
    const [vertical, horizontal] = position.split("-")
    
    if (isMobile) {
      // Mobile classes with compact padding
      const horizontalClass = {
        left: `items-start text-left px-4`,
        center: `items-center text-center px-4`,
        right: `items-end text-right px-4`,
      }[horizontal]
      
      const verticalClass = {
        top: `justify-start pt-12 pb-8`,
        middle: `justify-center py-8`,
        bottom: `justify-end pt-8 pb-16`,
      }[vertical]
      
      return `${horizontalClass} ${verticalClass}`
    } else {
      // Desktop classes with proper spacing
      const horizontalClass = {
        left: `md:items-start md:text-left md:px-0 md:pl-12 lg:pl-16`,
        center: `md:items-center md:text-center md:px-12 lg:px-20`,
        right: `md:items-end md:text-right md:px-0 md:pr-12 lg:pr-16`,
      }[horizontal]
      
      const verticalClass = {
        top: `md:justify-start md:pt-24 lg:pt-28 md:pb-16`,
        middle: `md:justify-center md:py-20`,
        bottom: `md:justify-end md:pt-16 md:pb-24 lg:pb-28`,
      }[vertical]
      
      return `${horizontalClass} ${verticalClass}`
    }
  }

  // Desktop positioning classes
  const desktopPositionClasses = getPositionClasses(currentSlide.text_position, false)
  
  // Mobile positioning classes (fallback to desktop if not set)
  const mobilePosition = currentSlide.mobile_text_position || currentSlide.text_position
  const mobilePositionClasses = getPositionClasses(mobilePosition, true)

  const hasStats = [
    { value: currentSlide.stat_1_value, label: currentSlide.stat_1_label },
    { value: currentSlide.stat_2_value, label: currentSlide.stat_2_label },
    { value: currentSlide.stat_3_value, label: currentSlide.stat_3_label },
  ].filter((s) => s.value).length > 0

  return (
    <section 
      className="relative overflow-hidden w-full"
      style={{
        height: "calc(100vh - 140px)",
        minHeight: "500px",
        maxHeight: "800px",
      }}
    >
      {/* Full-width background image with overlay */}
      <div className="absolute inset-0 w-full h-full">
        {/* Responsive background image */}
        <picture>
          {currentSlide.mobile_background_image_url && (
            <source
              srcSet={currentSlide.mobile_background_image_url}
              media="(max-width: 767px)"
            />
          )}
          <img
            src={currentSlide.background_image_url}
            alt={currentSlide.heading || "Hero slide"}
            className="w-full h-full object-cover transition-opacity duration-700"
            style={{ objectPosition: "center center" }}
            loading="eager"
          />
        </picture>
      </div>

      {/* Content container */}
      <div className={`relative z-10 h-full flex flex-col ${mobilePositionClasses} ${desktopPositionClasses}`} style={{ minHeight: "inherit" }}>
        <div className={`flex flex-col gap-2 md:gap-6 w-full ${
          currentSlide.text_position.includes('center') 
            ? 'max-w-3xl mx-auto' 
            : 'max-w-xl md:max-w-2xl'
        }`}>
          {/* Badge */}
          {currentSlide.badge_text && (
            <div
              className={`inline-flex ${currentSlide.text_position.includes('center') ? 'justify-center' : ''}`}
              style={{ animation: "var(--animation-hero-fade-up)" }}
            >
              <span
                className="flex items-center gap-1 md:gap-2 px-2.5 py-1 md:px-5 md:py-2 rounded-full text-[9px] md:text-sm font-semibold tracking-[0.12em] md:tracking-[0.16em] uppercase border backdrop-blur-md shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderColor: "rgba(255,255,255,0.4)",
                  color: currentSlide.badge_text_color || "white",
                }}
              >
                <Sparkle className="w-2 md:w-3.5 h-2 md:h-3.5" />
                {currentSlide.badge_text}
              </span>
            </div>
          )}

          {/* Headline */}
          <div style={{ animation: "var(--animation-hero-fade-up-delay-1)" }} className="space-y-0.5 md:space-y-1">
            <h1
              className="font-serif leading-tight tracking-tight text-2xl md:text-5xl lg:text-6xl"
              style={{
                lineHeight: "1.1",
                textShadow: "0 2px 20px rgba(0,0,0,0.3), 0 4px 40px rgba(0,0,0,0.2)",
              }}
            >
              {currentSlide.heading && (
                <span 
                  className="block mb-0.5 md:mb-1"
                  style={{
                    color: currentSlide.heading_color || "white"
                  }}
                >
                  {currentSlide.heading}
                </span>
              )}
              {currentSlide.highlight_text && (
                <span
                  className="block relative"
                  style={
                    currentSlide.highlight_color
                      ? { color: currentSlide.highlight_color, textShadow: "0 2px 20px rgba(0,0,0,0.3)" }
                      : {
                          background:
                            "linear-gradient(135deg, #ffd6e0 0%, #ffb8cc 45%, #ffd6e0 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }
                  }
                >
                  {currentSlide.highlight_text}
                </span>
              )}
            </h1>
          </div>

          {/* Decorative divider */}
          <div
            className={`flex items-center gap-1.5 md:gap-3 ${currentSlide.text_position.includes('center') ? 'justify-center' : ''}`}
            style={{ animation: "var(--animation-hero-fade-up-delay-2)" }}
          >
            <div
              className="h-px flex-1 max-w-[30px] md:max-w-[70px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.7), transparent)",
              }}
            />
            <Sparkle className="w-2 md:w-3.5 h-2 md:h-3.5 text-white opacity-70" />
            <div
              className="h-px w-4 md:w-8"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5))" }}
            />
          </div>

          {/* Subheading */}
          {currentSlide.subheading && (
            <p
              className="text-xs md:text-base lg:text-lg leading-relaxed max-w-lg"
              style={{
                animation: "var(--animation-hero-fade-up-delay-2)",
                color: currentSlide.subheading_color || "rgba(255, 255, 255, 0.95)",
                textShadow: "0 1px 3px rgba(0,0,0,0.3)"
              }}
            >
              {currentSlide.subheading}
            </p>
          )}

          {/* Buttons */}
          {(() => {
            const hasPrimary = !!currentSlide.primary_button_label
            const hasSecondary = !!currentSlide.secondary_button_label
            const buttonCount = (hasPrimary ? 1 : 0) + (hasSecondary ? 1 : 0)
            
            if (!hasPrimary && !hasSecondary) return null
            
            return (
              <div
                className={`flex flex-wrap gap-2 md:gap-4 pt-1 md:pt-2 ${currentSlide.text_position.includes('center') ? 'justify-center' : ''}`}
                style={{ animation: "var(--animation-hero-fade-up-delay-3)" }}
              >
                {hasPrimary && (
                  <Link
                    to={primaryLink}
                    className="group relative inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:px-8 md:py-4 rounded-full text-xs md:text-base font-bold tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #c4607a 0%, #E799AA 50%, #c9547e 100%)",
                      backgroundSize: "200% 200%",
                      boxShadow: "0 6px 30px rgba(228, 121, 150, 0.5)",
                      minWidth: "120px",
                      color: currentSlide.primary_button_text_color || "white",
                    }}
                  >
                    <span className="relative z-10">{currentSlide.primary_button_label}</span>
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                    {/* Shimmer overlay */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.3) 50%, transparent 80%)",
                      }}
                    />
                  </Link>
                )}
                {hasSecondary && (
                  <Link
                    to={secondaryLink}
                    className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 md:px-8 md:py-4 rounded-full text-xs md:text-base font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:bg-white/25 backdrop-blur-md"
                    style={{
                      border: "2px solid rgba(255,255,255,0.6)",
                      background: "rgba(255,255,255,0.2)",
                      minWidth: "120px",
                      color: currentSlide.secondary_button_text_color || "white",
                    }}
                  >
                    {currentSlide.secondary_button_label}
                  </Link>
                )}
              </div>
            )
          })()}

          {/* Stats Row */}
          {hasStats && (
            <div
              className={`flex flex-wrap gap-4 md:gap-10 pt-2 md:pt-6 mt-1 md:mt-3 ${currentSlide.text_position.includes('center') ? 'justify-center' : ''}`}
              style={{
                animation: "var(--animation-hero-fade-up-delay-4)",
                borderTop: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              {[
                { value: currentSlide.stat_1_value, label: currentSlide.stat_1_label },
                { value: currentSlide.stat_2_value, label: currentSlide.stat_2_label },
                { value: currentSlide.stat_3_value, label: currentSlide.stat_3_label },
              ]
                .filter((s) => s.value)
                .map((stat, i) => (
                  <div key={i} className="flex flex-col gap-0.5 md:gap-1">
                    <span
                      className="font-serif font-bold leading-none text-xl md:text-4xl lg:text-5xl"
                      style={{
                        color: currentSlide.stats_text_color || "white",
                        textShadow: "0 2px 12px rgba(0,0,0,0.4)",
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-[9px] md:text-sm tracking-[0.10em] md:tracking-[0.14em] uppercase font-semibold font-sans"
                      style={{
                        color: currentSlide.stats_text_color || "rgba(255, 255, 255, 0.95)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows (only show if multiple slides) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="text-white w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
            aria-label="Next slide"
          >
            <ChevronRight className="text-white w-5 h-5 md:w-6 md:h-6" />
          </button>
        </>
      )}

      {/* Carousel Navigation Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-1.5 md:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="transition-all duration-300"
              style={{
                width: currentIndex === index ? "24px" : "6px",
                height: "6px",
                borderRadius: "3px",
                background: currentIndex === index
                  ? "white"
                  : "rgba(255,255,255,0.4)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
