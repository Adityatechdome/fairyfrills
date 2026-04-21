import { useState, useEffect } from "react"

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-24 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: "linear-gradient(135deg, #E799AA 0%, #d47a8f 100%)",
        boxShadow: "0 4px 16px rgba(231,153,170,0.45)",
        color: "#fff",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}

export default ScrollToTop
