import { useCustomer } from "@/lib/context/customer"
import { sdk } from "@/lib/utils/sdk"
import { queryKeys } from "@/lib/utils/query-keys"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, useNavigate, useRouter, useSearch } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { AuthLoginDecorativePanel } from "@/components/auth-decorative-panel"

type Tab = "email" | "phone"
type Screen = "enter-identifier" | "enter-otp"

const RESEND_SECONDS = 60

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const CheckIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const LoginPage = () => {
  const [tab, setTab] = useState<Tab>("email")
  const [screen, setScreen] = useState<Screen>("enter-identifier")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const navigate = useNavigate()
  const router = useRouter()
  const location = useLocation()
  const search = useSearch({ from: "/$countryCode/account/login" })
  const queryClient = useQueryClient()
  const { isAuthenticated } = useCustomer()
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    const dest = (search as { redirect?: string }).redirect
    if (dest) {
      router.history.push(dest)
    } else {
      navigate({ to: "/$countryCode", params: { countryCode } })
    }
  }, [isAuthenticated]) // eslint-disable-line react-hooks/exhaustive-deps

  const startCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(RESEND_SECONDS)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (tab === "email") {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.")
        return
      }
      setLoading(true)
      try {
        await sdk.client.fetch("/store/otp/email/send", {
          method: "POST",
          body: { email },
        })
        startCountdown()
        setOtp(["", "", "", "", "", ""])
        setScreen("enter-otp")
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.")
      } finally {
        setLoading(false)
      }
    } else {
      const cleanPhone = phone.replace(/\D/g, "")
      if (cleanPhone.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.")
        return
      }
      setLoading(true)
      try {
        await sdk.client.fetch("/store/otp/phone/send", {
          method: "POST",
          body: { phone_number: cleanPhone },
        })
        startCountdown()
        setOtp(["", "", "", "", "", ""])
        setScreen("enter-otp")
        setTimeout(() => otpRefs.current[0]?.focus(), 100)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6)
      if (digits.length === 6) {
        setOtp(digits.split(""))
        otpRefs.current[5]?.focus()
        return
      }
    }
    const digit = value.replace(/\D/g, "").slice(-1)
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp]
      newOtp[index - 1] = ""
      setOtp(newOtp)
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits.")
      return
    }

    setLoading(true)
    try {
      let token: string

      if (tab === "email") {
        const data = await sdk.client.fetch<{ token: string; customer: { id: string } }>(
          "/store/otp/email/verify",
          { method: "POST", body: { email, otp_code: otpCode } }
        )
        token = data.token
      } else {
        const cleanPhone = phone.replace(/\D/g, "")
        const data = await sdk.client.fetch<{ token: string; customer: { id: string } }>(
          "/store/otp/phone/verify",
          { method: "POST", body: { phone_number: cleanPhone, otp_code: otpCode } }
        )
        token = data.token
      }

      // Set the auth token on the SDK client
      sdk.client.setToken(token)

      // Fetch and cache the customer
      const { customer } = await sdk.store.customer.retrieve()
      queryClient.setQueryData(queryKeys.customer.current(), customer)

      setSuccess(true)
      setTimeout(() => {
        const dest = (search as { redirect?: string }).redirect
        if (dest) {
          router.history.push(dest)
        } else {
          navigate({ to: "/$countryCode", params: { countryCode } })
        }
      }, 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError("")
    setOtp(["", "", "", "", "", ""])

    try {
      if (tab === "email") {
        await sdk.client.fetch("/store/otp/email/send", {
          method: "POST",
          body: { email },
        })
      } else {
        const cleanPhone = phone.replace(/\D/g, "")
        await sdk.client.fetch("/store/otp/phone/send", {
          method: "POST",
          body: { phone_number: cleanPhone },
        })
      }
      startCountdown()
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP.")
    }
  }

  const otpComplete = otp.every((d) => d !== "")
  const identifier = tab === "email" ? email : `+91 ${phone}`

  if (success) {
    return (
      <div
        className="flex flex-1 min-h-screen items-center justify-center px-4"
        style={{ background: "#fdf0f3" }}
      >
        <div
          className="bg-white rounded-3xl shadow-sm px-10 py-14 text-center w-full max-w-sm"
          style={{ animation: "auth-fade-in 0.4s ease both" }}
        >
          <div
            className="mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "#F0FFF4", color: "#22c55e" }}
          >
            <CheckIcon />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
            Welcome!
          </h2>
          <p className="text-sm" style={{ color: "#888" }}>
            Signed in successfully. Redirecting...
          </p>
          <div className="mt-5 flex justify-center">
            <span
              className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full"
              style={{ borderColor: "#E799AA", animation: "spin 0.7s linear infinite" }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex flex-1"
      style={{ animation: "auth-fade-in 0.45s ease both", minHeight: "100vh" }}
    >
      <AuthLoginDecorativePanel />

      <div
        className="flex flex-1 lg:w-1/2 items-center justify-center px-6 py-12"
        style={{ background: "#fdf0f3" }}
      >
        <div className="w-full max-w-md">

          {screen === "enter-identifier" && (
            <>
              <div className="mb-7">
                <h1 className="font-serif text-4xl font-bold" style={{ color: "#1a1a1a" }}>
                  Welcome
                </h1>
                <p className="mt-1.5 text-sm" style={{ color: "#888" }}>
                  Sign in or create your Fairy Frills account
                </p>
              </div>

              {/* Tabs */}
              <div
                className="flex rounded-xl p-1 mb-6"
                style={{ background: "#F3E4E8" }}
              >
                <button
                  type="button"
                  onClick={() => { setTab("email"); setError("") }}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    background: tab === "email" ? "#fff" : "transparent",
                    color: tab === "email" ? "#8B1A4A" : "#888",
                    boxShadow: tab === "email" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setTab("phone"); setError("") }}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    background: tab === "phone" ? "#fff" : "transparent",
                    color: tab === "phone" ? "#8B1A4A" : "#888",
                    boxShadow: tab === "phone" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-5">
                {error && (
                  <div
                    className="text-sm px-4 py-3 rounded-xl"
                    style={{ background: "#fff0f3", border: "1px solid #f8c8d0", color: "#b0384e" }}
                  >
                    {error}
                  </div>
                )}

                {tab === "email" ? (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#333" }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="auth-input w-full"
                    />
                    <p className="mt-2 text-xs" style={{ color: "#aaa" }}>
                      We'll send a 6-digit OTP to this email
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: "#333" }}>
                      Mobile Number
                    </label>
                    <div className="flex">
                      <div
                        className="flex items-center gap-2 px-3.5 border rounded-l-xl text-sm font-medium shrink-0"
                        style={{
                          background: "#FFF5F7",
                          borderColor: "#E8D8DC",
                          color: "#555",
                          height: "48px",
                          borderRight: "none",
                        }}
                      >
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-4 border rounded-r-xl text-sm outline-none transition-all"
                        style={{ height: "48px", borderColor: "#E8D8DC", background: "#FAFAFA" }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#E799AA"
                          e.target.style.boxShadow = "0 0 0 3px rgba(231,153,170,0.15)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#E8D8DC"
                          e.target.style.boxShadow = "none"
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "#aaa" }}>
                      We'll send a 6-digit OTP via SMS
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="auth-btn w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        style={{ animation: "spin 0.7s linear infinite" }}
                      />
                      Sending OTP...
                    </span>
                  ) : "Send OTP"}
                </button>

                <div className="flex items-center justify-center gap-1.5" style={{ color: "#aaa" }}>
                  <ShieldIcon />
                  <span className="text-xs">Secure &amp; Instant — No password required</span>
                </div>
              </form>
            </>
          )}

          {screen === "enter-otp" && (
            <div
              className="bg-white rounded-3xl shadow-sm px-8 py-10"
              style={{ animation: "auth-fade-in 0.35s ease both" }}
            >
              <h1 className="font-serif text-3xl font-bold text-center mb-1.5" style={{ color: "#1a1a1a" }}>
                Enter OTP
              </h1>
              <p className="text-sm text-center mb-2" style={{ color: "#888" }}>
                OTP sent to{" "}
                <span style={{ color: "#8B1A4A", fontWeight: 600 }}>{identifier}</span>
              </p>
              <p className="text-xs text-center mb-8" style={{ color: "#bbb" }}>
                Check your {tab === "email" ? "inbox" : "messages"} for the 6-digit code
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                {error && (
                  <div
                    className="text-sm px-4 py-3 rounded-xl text-center"
                    style={{ background: "#fff0f3", border: "1px solid #f8c8d0", color: "#b0384e" }}
                  >
                    {error}
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onFocus={(e) => {
                        e.target.select()
                        e.target.style.borderColor = "#E799AA"
                        e.target.style.boxShadow = "0 0 0 3px rgba(231,153,170,0.2)"
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = digit ? "#E799AA" : "#E8D8DC"
                        e.target.style.boxShadow = "none"
                      }}
                      className="w-11 h-12 text-center text-lg font-semibold border-2 rounded-xl outline-none transition-all"
                      style={{
                        borderColor: digit ? "#E799AA" : "#E8D8DC",
                        background: digit ? "#FFF5F7" : "#FAFAFA",
                        color: "#1a1a1a",
                      }}
                    />
                  ))}
                </div>

                <div className="text-center text-sm" style={{ color: "#888" }}>
                  {countdown > 0 ? (
                    <span>
                      Resend OTP in{" "}
                      <span style={{ color: "#E799AA", fontWeight: 600 }}>
                        0:{countdown.toString().padStart(2, "0")}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-semibold transition-colors hover:underline"
                      style={{ color: "#E799AA" }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !otpComplete}
                  className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all"
                  style={{
                    background: "#8B1A4A",
                    opacity: loading || !otpComplete ? 0.5 : 1,
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span
                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        style={{ animation: "spin 0.7s linear infinite" }}
                      />
                      Verifying...
                    </span>
                  ) : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => { setScreen("enter-identifier"); setOtp(["", "", "", "", "", ""]); setError("") }}
                  className="w-full text-sm text-center transition-colors hover:underline"
                  style={{ color: "#888" }}
                >
                  Change {tab === "email" ? "Email" : "Number"}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default LoginPage
