import { useCustomer } from "@/lib/context/customer"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useQueryClient } from "@tanstack/react-query"
import { Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { AuthRegisterDecorativePanel } from "@/components/auth-decorative-panel"

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useCustomer()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"
  const search = useSearch({ strict: false }) as { redirect?: string }

  useEffect(() => {
    if (isAuthenticated) {
      if (search?.redirect) {
        window.location.href = search.redirect
      } else {
        navigate({ to: "/$countryCode", params: { countryCode } })
      }
    }
  }, [isAuthenticated, navigate, countryCode, search?.redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await sdk.auth.register("customer", "emailpass", { email, password })
      await sdk.auth.login("customer", "emailpass", { email, password })
      const { customer } = await sdk.store.customer.create({
        email,
        first_name: firstName,
        last_name: lastName,
      })
      queryClient.setQueryData(queryKeys.customer.current(), customer)

      if (search?.redirect) {
        window.location.href = search.redirect
      } else {
        navigate({ to: "/$countryCode", params: { countryCode } })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again."
      if (
        message.toLowerCase().includes("exists") ||
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("identity with")
      ) {
        setError("An account with this email already exists. Please sign in instead.")
      } else if (message.toLowerCase().includes("unauthorized")) {
        setError("Registration succeeded but login failed. Please try signing in.")
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex flex-1"
      style={{ animation: "auth-fade-in 0.45s ease both", minHeight: "100vh" }}
    >
      <AuthRegisterDecorativePanel />

      {/* Right: form panel */}
      <div
        className="flex flex-1 lg:w-1/2 items-center justify-center px-6 py-12"
        style={{ background: "#fdf0f3" }}
      >
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="mb-7">
            <h1
              className="font-serif text-4xl font-bold"
              style={{ color: "#1a1a1a" }}
            >
              Join the Magic
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "#888" }}>
              Create your Fairy Frills account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="text-sm px-4 py-3 rounded-xl"
                style={{
                  background: "#fff0f3",
                  border: "1px solid #f8c8d0",
                  color: "#b0384e",
                }}
              >
                {error}
              </div>
            )}

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#333" }}
                >
                  First Name
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#aaa" }}
                  >
                    <PersonIcon />
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    autoComplete="given-name"
                    className="auth-input w-full"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#333" }}
                >
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  autoComplete="family-name"
                  className="auth-input w-full"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#333" }}
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#aaa" }}
                >
                  <EmailIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="auth-input w-full"
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#333" }}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#aaa" }}
                >
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="auth-input w-full"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#aaa" }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#333" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#aaa" }}
                >
                  <LockIcon />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="auth-input w-full"
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#aaa" }}
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="auth-btn w-full"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-1.5" style={{ color: "#aaa" }}>
              <ShieldIcon />
              <span className="text-xs">Secure Signup — Your data is encrypted</span>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#e8d8dc" }} />
            <span className="text-xs" style={{ color: "#bbb" }}>Already a member?</span>
            <div className="flex-1 h-px" style={{ background: "#e8d8dc" }} />
          </div>

          {/* Sign in button */}
          <Link
            to="/$countryCode/account/login"
            params={{ countryCode }}
            className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-colors"
            style={{
              border: "1.5px solid #E799AA",
              color: "#8B1A4A",
              background: "transparent",
            }}
          >
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
