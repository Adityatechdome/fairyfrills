import { useCustomer } from "@/lib/context/customer"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { type ReactNode } from "react"

export const AccountLayout = ({ children }: { children: ReactNode }) => {
  const { customer, logout } = useCustomer()
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const currentPath = location.pathname

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/$countryCode", params: { countryCode } })
  }

  const linkClass = (path: string) =>
    `px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
      currentPath.includes(`/account/${path}`)
        ? "bg-[var(--color-primary-50)] text-[var(--color-primary-dark)] border-l-2 border-[var(--color-primary)]"
        : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)]"
    }`

  return (
    <div className="content-container py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <aside className="lg:w-64 shrink-0">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-bold text-[var(--color-text)]">
              My Account
            </h2>
            {customer && (
              <p className="text-sm text-[var(--color-text-light)] mt-1">
                {customer.first_name} {customer.last_name}
              </p>
            )}
          </div>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto">
            <Link
              to="/$countryCode/account/profile"
              params={{ countryCode }}
              className={linkClass("profile")}
            >
              My Profile
            </Link>
            <Link
              to="/$countryCode/account/orders"
              params={{ countryCode }}
              className={linkClass("orders")}
            >
              My Orders
            </Link>
            <Link
              to="/$countryCode/account/addresses"
              params={{ countryCode }}
              className={linkClass("addresses")}
            >
              My Addresses
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-medium text-left text-[var(--color-text)] hover:bg-[var(--color-primary-50)] hover:text-[var(--color-primary-dark)] transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign Out
            </button>
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
