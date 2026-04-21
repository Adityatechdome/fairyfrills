import { sdk } from "@/lib/utils/sdk"
import { getCountryCodeFromPath } from "@/lib/utils/region"
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"

const RESEND_COUNTDOWN_SECONDS = 60

type Screen = "enter-phone" | "enter-otp" | "success"

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

function formatPhone(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}

const PhoneVerifyPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { redirect?: string }
  const countryCode = getCountryCodeFromPath(location.pathname) || "in"

  const [screen, setScreen] = useState<Screen>("enter-phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const startCountdown = () => {
    setCountdown(RESEND_COUNTDOWN_SECONDS)
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

    const cleanPhone = phoneNumber.replace(/\D/g, "")
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit Indian mobile number.")
      return
    }

    setLoading(true)
    try {
      await sdk.client.fetch("/store/otp/send", {
        method: "POST",
        body: { phone_number: cleanPhone },
      })
      startCountdown()
      setOtp(["", "", "", "", "", ""])
      setScreen("enter-otp")
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6)
      if (digits.length === 6) {
        const newOtp = digits.split("")
        setOtp(newOtp)
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
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        otpRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of your OTP.")
      return
    }

    setLoading(true)
    try {
      await sdk.client.fetch("/store/otp/verify", {
        method: "POST",
        body: {
          phone_number: phoneNumber.replace(/\D/g, ""),
          otp_code: otpCode,
        },
      })
      setScreen("success")
      setTimeout(() => {
        if (search?.redirect) {
          window.location.href = search.redirect
        } else {
          navigate({ to: "/$countryCode/checkout", params: { countryCode }, search: { step: "addresses" } })
        }
      }, 1500)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed. Please try again."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setError("")
    setOtp(["", "", "", "", "", ""])

    try {
      await sdk.client.fetch("/store/otp/send", {
        method: "POST",
        body: { phone_number: phoneNumber.replace(/\D/g, "") },
      })
      startCountdown()
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP."
      setError(message)
    }
  }

  const otpComplete = otp.every((d) => d !== "")

  return (
    <div
      className="flex flex-1 min-h-screen items-center justify-center px-4 py-12"
      style={{ background: "#fdf0f3", animation: "auth-fade-in 0.4s ease both" }}
    >
      <div className="w-full max-w-md">

        {screen === "enter-phone" && (
          <div className="bg-white rounded-3xl shadow-sm px-8 py-10">
            {/* Icon */}
            <div
              className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#FFF0F4", color: "#E799AA" }}
            >
              <PhoneIcon />
            </div>

            <h1 className="font-serif text-3xl font-bold text-center mb-1.5" style={{ color: "#1a1a1a" }}>
              Verify Your Phone
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: "#888" }}>
              We need to verify your mobile number before you can place an order
            </p>

            <form onSubmit={handleSendOtp} className="space-y-5">
              {error && (
                <div
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{ background: "#fff0f3", border: "1px solid #f8c8d0", color: "#b0384e" }}
                >
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#333" }}>
                  Mobile Number
                </label>
                <div className="flex gap-0">
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
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit number"
                    className="flex-1 px-4 border rounded-r-xl text-sm outline-none transition-all"
                    style={{
                      height: "48px",
                      borderColor: "#E8D8DC",
                      background: "#FAFAFA",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#E799AA"
                      e.target.style.boxShadow = "0 0 0 3px rgba(231,153,170,0.15)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E8D8DC"
                      e.target.style.boxShadow = "none"
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.replace(/\D/g, "").length !== 10}
                className="w-full py-3 rounded-full text-sm font-semibold text-white transition-all"
                style={{
                  background: loading || phoneNumber.replace(/\D/g, "").length !== 10
                    ? "#E799AA"
                    : "#E799AA",
                  opacity: loading || phoneNumber.replace(/\D/g, "").length !== 10 ? 0.6 : 1,
                }}
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

              <p className="text-xs text-center" style={{ color: "#aaa" }}>
                OTP will be sent to your mobile number via SMS
              </p>

              <div className="flex items-center justify-center gap-1.5" style={{ color: "#aaa" }}>
                <ShieldIcon />
                <span className="text-xs">Secure — Your data is encrypted</span>
              </div>
            </form>
          </div>
        )}

        {screen === "enter-otp" && (
          <div className="bg-white rounded-3xl shadow-sm px-8 py-10">
            <div
              className="mx-auto mb-5 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "#FFF0F4", color: "#E799AA" }}
            >
              <PhoneIcon />
            </div>

            <h1 className="font-serif text-3xl font-bold text-center mb-1.5" style={{ color: "#1a1a1a" }}>
              Enter OTP
            </h1>
            <p className="text-sm text-center mb-2" style={{ color: "#888" }}>
              OTP sent to {formatPhone(phoneNumber.replace(/\D/g, ""))}
            </p>
            <p className="text-xs text-center mb-8" style={{ color: "#bbb" }}>
              Check your messages for the 6-digit code
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div
                  className="text-sm px-4 py-3 rounded-xl text-center"
                  style={{ background: "#fff0f3", border: "1px solid #f8c8d0", color: "#b0384e" }}
                >
                  {error}
                </div>
              )}

              {/* 6-digit OTP boxes */}
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

              {/* Resend */}
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
                ) : "Verify"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreen("enter-phone")
                  setOtp(["", "", "", "", "", ""])
                  setError("")
                }}
                className="w-full text-sm text-center transition-colors hover:underline"
                style={{ color: "#888" }}
              >
                Change Number
              </button>
            </form>
          </div>
        )}

        {screen === "success" && (
          <div
            className="bg-white rounded-3xl shadow-sm px-8 py-12 text-center"
            style={{ animation: "auth-fade-in 0.4s ease both" }}
          >
            <div
              className="mx-auto mb-5 w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#F0FFF4", color: "#22c55e" }}
            >
              <CheckCircleIcon />
            </div>
            <h2 className="font-serif text-2xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
              Phone Verified Successfully!
            </h2>
            <p className="text-sm" style={{ color: "#888" }}>
              Proceeding to checkout...
            </p>
            <div className="mt-5 flex justify-center">
              <span
                className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full"
                style={{ borderColor: "#E799AA", animation: "spin 0.7s linear infinite" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhoneVerifyPage
