import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "@tanstack/react-router"
import { getCountryCodeFromPath } from "@/lib/utils/region"

interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")

  // Auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
    }
  }, [isOpen])

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    onClose()
    navigate({
      to: "/$countryCode/search",
      params: { countryCode },
      search: { q: trimmed },
    } as any)
  }

  return (
    <div
      className={`
        absolute top-full right-0 z-50 mt-1
        transition-all duration-200 ease-out origin-top-right
        ${isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none"
        }
      `}
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center bg-white border border-[var(--color-border-light)] rounded-lg shadow-lg overflow-hidden"
        style={{ width: "280px" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-light)] bg-transparent outline-none px-3 py-2.5"
          style={{ boxShadow: "none" }}
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="p-1.5 text-[var(--color-text-light)] hover:text-[var(--color-text)] transition-colors"
            aria-label="Clear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="px-3 py-2.5 text-[var(--color-text-light)] hover:text-[var(--color-primary-dark)] transition-colors border-l border-[var(--color-border-light)]"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
