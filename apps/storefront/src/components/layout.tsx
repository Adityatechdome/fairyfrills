import { AnnouncementBar } from "@/components/announcement-bar"
import ErrorBoundary from "@/components/error-boundary"
import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"
import ScrollToTop from "@/components/scroll-to-top"
import WhatsAppButton from "@/components/whatsapp-button"
import { CartProvider } from "@/lib/context/cart"
import { CustomerProvider } from "@/lib/context/customer"
import { ToastProvider } from "@/lib/context/toast-context"
import { Outlet } from "@tanstack/react-router"

const Layout = () => {
  return (
    <ToastProvider>
      <CustomerProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col overflow-x-hidden">
            <AnnouncementBar />
            <Navbar />

            <main className="relative flex-1">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </main>

            <Footer />
          </div>
          <WhatsAppButton />
          <ScrollToTop />
        </CartProvider>
      </CustomerProvider>
    </ToastProvider>
  )
}

export default Layout
