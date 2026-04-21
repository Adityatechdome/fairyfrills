import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import OtpVerificationModuleService from "../../../../modules/otp-verification/service"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOtpViaMSG91(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.MSG91_API_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const senderId = process.env.MSG91_SENDER_ID || "FRILLS"

  if (!apiKey || !templateId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "SMS service is not configured. Please contact support."
    )
  }

  const mobileWithCode = `91${phone}`

  const payload = {
    template_id: templateId,
    short_url: "0",
    realTimeResponse: "1",
    recipients: [
      {
        mobiles: mobileWithCode,
        otp,
      },
    ],
  }

  const response = await fetch("https://api.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      "Content-Type": "application/JSON",
      authkey: apiKey,
      accept: "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Failed to send OTP: ${errorText}`
    )
  }
}

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const { phone_number } = req.body as { phone_number: string }

  if (!phone_number) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "phone_number is required")
  }

  const cleanPhone = phone_number.replace(/\D/g, "")
  if (cleanPhone.length !== 10) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Please enter a valid 10-digit Indian mobile number"
    )
  }

  const otpService: OtpVerificationModuleService = req.scope.resolve("otpVerification")
  const now = new Date()

  const recentRecords = await otpService.listOtpRecords({
    customer_id: customerId,
    phone_number: cleanPhone,
    verified: false,
  })

  for (const record of recentRecords) {
    const expiresAt = new Date(record.expires_at)
    const createdAt = new Date(record.created_at)
    const secondsSinceCreated = (now.getTime() - createdAt.getTime()) / 1000

    if (secondsSinceCreated < 60 && expiresAt > now) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Please wait before requesting another OTP"
      )
    }
  }

  const otp = generateOtp()
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000)

  await otpService.createOtpRecords({
    customer_id: customerId,
    phone_number: cleanPhone,
    otp_code: otp,
    expires_at: expiresAt,
    attempts: 0,
    verified: false,
    locked_until: null,
  })

  await sendOtpViaMSG91(cleanPhone, otp)

  res.json({
    success: true,
    message: "OTP sent successfully",
    phone_number: cleanPhone,
  })
}
