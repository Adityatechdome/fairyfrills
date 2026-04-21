import { useCustomer } from "@/lib/context/customer"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

export const AccountDropdown = () => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { customer, isAuthenticated, logout } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate({ to: "/$countryCode", params: { countryCode } })
  }

  const handleIconClick = () => {
    if (!isAuthenticated) {
      navigate({ to: "/$countryCode/account/login", params: { countryCode } })
    } else {
      setOpen(!open)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleIconClick}
        className="text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors p-1"
        aria-label="Account"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      </button>

      {open && isAuthenticated && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white shadow-lg border border-[var(--color-border-light)] z-50">
          <div className="py-3">
            <div className="flex flex-col py-1">
              <Link
                to="/$countryCode/account/profile"
                params={{ countryCode }}
                onClick={() => setOpen(false)}
                className="px-5 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                My Profile
              </Link>
              <Link
                to="/$countryCode/account/orders"
                params={{ countryCode }}
                onClick={() => setOpen(false)}
                className="px-5 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                My Orders
              </Link>
              <Link
                to="/$countryCode/account/addresses"
                params={{ countryCode }}
                onClick={() => setOpen(false)}
                className="px-5 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)] transition-colors"
              >
                My Addresses
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
