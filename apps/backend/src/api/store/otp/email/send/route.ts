import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import OtpVerificationModuleService from "../../../../../modules/otp-verification/service"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendEmailOtpViaMSG91(email: string, otp: string): Promise<void> {
  const apiKey = process.env.MSG91_API_KEY
  const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID

  if (!apiKey) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "OTP service is not configured. Please contact support."
    )
  }

  if (!templateId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Email OTP template is not configured. Please contact support."
    )
  }

  const url = "https://control.msg91.com/api/v5/email/send"
  const headers = { "Content-Type": "application/json", authkey: apiKey }
  const payload = {
    to: [{ email }],
    from: { email: "noreply@mail.fairyfrills.in", name: "Fairy Frills" },
    domain: "mail.fairyfrills.in",
    template_id: templateId,
    variables: { otp, company_name: "Fairy Frills" },
  }

  console.log("[Email OTP] Sending via MSG91 Email API", { url, email, templateId })

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  console.log("[Email OTP] MSG91 response:", response.status, responseText)

  let responseJson: Record<string, unknown> = {}
  try {
    responseJson = JSON.parse(responseText)
  } catch {
    // non-JSON response
  }

  if (!response.ok || responseJson.type === "error") {
    const errMsg = (responseJson.message as string) || responseText || "Unknown error"
    console.error("[Email OTP] Failed to send:", errMsg)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Failed to send OTP email: ${errMsg}`
    )
  }

  console.log("[Email OTP] Sent successfully to:", email)
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email } = req.body as { email: string }

  if (!email || !isValidEmail(email)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A valid email address is required"
    )
  }

  const normalizedEmail = email.trim().toLowerCase()
  const identifier = `email:${normalizedEmail}`
  const otpService: OtpVerificationModuleService = req.scope.resolve("otpVerification")
  const now = new Date()

  // 60-second rate limit check
  const recentRecords = await otpService.listOtpRecords({
    customer_id: identifier,
    verified: false,
  })

  for (const record of recentRecords) {
    const expiresAt = new Date(record.expires_at)
    const createdAt = new Date(record.created_at)
    const secondsSinceCreated = (now.getTime() - createdAt.getTime()) / 1000

    if (secondsSinceCreated < 60 && expiresAt > now) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Please wait 60 seconds before requesting another OTP"
      )
    }
  }

  const otp = generateOtp()
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000)

  // Send OTP via MSG91 Email API
  await sendEmailOtpViaMSG91(normalizedEmail, otp)

  // Store OTP code locally for verification
  await otpService.createOtpRecords({
    customer_id: identifier,
    phone_number: normalizedEmail,
    otp_code: otp,
    expires_at: expiresAt,
    attempts: 0,
    verified: false,
    locked_until: null,
  })

  res.json({
    success: true,
    message: "OTP sent to your email",
    email: normalizedEmail,
  })
}
