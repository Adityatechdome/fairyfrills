import { useEffect, useRef, useState } from "react"
import { AccountDropdown } from "@/components/account-dropdown"
import { CartDropdown } from "@/components/cart"
import { SearchBar } from "@/components/search-bar"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useCategories } from "@/lib/hooks/use-categories"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { scrollToVirtualTryon } from "@/pages/home"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"

const LOGO_URL = "https://cdn.mignite.app/ws/works_01KJG05M29Q8ZYYH6Z387MHSB9/Fairy-frills-logo-01KP7ZMG8G55FCQ1KZ3Q94QJAZ.png"

export const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const currentPath = location.pathname

  const [searchOpen, setSearchOpen] = useState(false)
  const searchWrapperRef = useRef<HTMLDivElement>(null)

  // Close search when clicking outside the icon + popup wrapper
  useEffect(() => {
    if (!searchOpen) return
    const handleMouseDown = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [searchOpen])

  const { data: topLevelCategories } = useCategories({
    fields: "id,name,handle,parent_category_id",
    queryParams: { parent_category_id: "null" },
  })

  const categoryLinks = topLevelCategories?.map((cat) => ({
    id: cat.id,
    name: cat.name,
    handle: cat.handle,
  })) ?? []

  const isHomePage = currentPath === `/${countryCode}` || currentPath === `/${countryCode}/`

  const isActiveCategory = (handle: string) => {
    return currentPath.includes(`/categories/${handle}`)
  }

  const handleVirtualTryon = () => {
    scrollToVirtualTryon(countryCode, navigate)
  }

  return (
    <div className="sticky top-0 inset-x-0 z-40">
      <header className="relative mx-auto border-b bg-white border-[var(--color-border-light)]">
        <nav className="flex items-center w-full h-16 lg:h-18 px-0">
          {/* Mobile: hamburger left */}
          <div className="lg:hidden flex items-center">
            <Drawer>
              <DrawerTrigger className="text-[var(--color-text)] hover:text-[var(--color-primary)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </DrawerTrigger>
              <DrawerContent side="left">
                <DrawerHeader>
                  <DrawerTitle className="font-serif text-xl tracking-[0.2em]">FAIRY FRILLS</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col py-4">
                  <DrawerClose asChild>
                    <Link
                      to="/$countryCode"
                      params={{ countryCode }}
                      className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
                        isHomePage
                          ? "text-[var(--color-primary-dark)] bg-[var(--color-primary-50)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)]"
                      }`}
                    >
                      Home
                    </Link>
                  </DrawerClose>
                  {categoryLinks.map((link) => (
                    <DrawerClose key={link.id} asChild>
                      <Link
                        to="/$countryCode/categories/$handle"
                        params={{ countryCode, handle: link.handle }}
                        className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
                          isActiveCategory(link.handle)
                            ? "text-[var(--color-primary-dark)] bg-[var(--color-primary-50)]"
                            : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)]"
                        }`}
                      >
                        {link.name}
                      </Link>
                    </DrawerClose>
                  ))}
                  {/* Mobile Virtual Try-On CTA */}
                  <DrawerClose asChild>
                    <Link
                      to="/$countryCode/virtual-try-on"
                      params={{ countryCode }}
                      className={`px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] transition-colors ${
                        currentPath.includes("/virtual-try-on")
                          ? "text-[var(--color-primary-dark)] bg-[var(--color-primary-50)]"
                          : "text-[var(--color-text)] hover:bg-[var(--color-primary-50)]"
                      }`}
                    >
                      <span className="hidden xs:inline">Virtual Try-On</span>
                      <span className="inline xs:hidden">Try Now</span>
                    </Link>
                  </DrawerClose>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Left: Logo + brand name - flush left */}
          <Link
            to="/$countryCode"
            params={{ countryCode }}
            className="flex items-center gap-2.5 shrink-0 ml-4 lg:ml-3"
          >
            <img src={LOGO_URL} alt="Fairy Frills" className="w-8 h-8 lg:w-10 lg:h-10 object-contain" />
            <span className="font-serif text-lg sm:text-xl font-semibold tracking-[0.2em] text-[var(--color-text)]">
              FAIRY FRILLS
            </span>
          </Link>

          {/* Center: Desktop navigation links - increased left margin for gap from logo */}
          <div className="hidden lg:flex items-center justify-center gap-x-8 flex-1 h-full ml-16">
            <Link
              to="/$countryCode"
              params={{ countryCode }}
              className={`relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors py-1 ${
                isHomePage
                  ? "text-[var(--color-primary)]"
                  : "text-gray-700 hover:text-[var(--color-primary)]"
              }`}
            >
              Home
              {isHomePage && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--color-primary)]" />
              )}
            </Link>
            {categoryLinks.map((link) => {
              const isActive = isActiveCategory(link.handle)
              return (
                <Link
                  key={link.id}
                  to="/$countryCode/categories/$handle"
                  params={{ countryCode, handle: link.handle }}
                  className={`relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors py-1 ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : "text-gray-700 hover:text-[var(--color-primary)]"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--color-primary)]" />
                  )}
                </Link>
              )
            })}

            {/* Desktop Virtual Try-On CTA */}
            <Link
              to="/$countryCode/virtual-try-on"
              params={{ countryCode }}
              className={`relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors py-1 whitespace-nowrap ${
                currentPath.includes("/virtual-try-on")
                  ? "text-[var(--color-primary)]"
                  : "text-gray-700 hover:text-[var(--color-primary)]"
              }`}
            >
              Virtual Try-On
              {currentPath.includes("/virtual-try-on") && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--color-primary)]" />
              )}
            </Link>
          </div>

          {/* Right: Search + Account + Cart - flush right */}
          <div className="flex items-center gap-4 ml-auto lg:ml-12 shrink-0 pr-3">
            {/* Search icon — relative so dropdown anchors here */}
            <div className="relative" ref={searchWrapperRef}>
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search products"
                className={`p-1.5 rounded-full transition-colors ${
                  searchOpen
                    ? "text-[var(--color-primary-dark)] bg-[var(--color-primary-50)]"
                    : "text-[var(--color-text)] hover:text-[var(--color-primary-dark)]"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803a7.5 7.5 0 0 0 10.607 0Z"
                  />
                </svg>
              </button>

              <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            </div>

            <AccountDropdown />
            <CartDropdown />
          </div>
        </nav>
      </header>
    </div>
  )
}
