import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import OtpVerificationModuleService from "../../../../../modules/otp-verification/service"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendPhoneOtpViaMSG91(mobile10: string, otp: string): Promise<void> {
  const apiKey = process.env.MSG91_API_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const senderId = process.env.MSG91_SENDER_ID || "FAIFLL"
  const entityId = process.env.MSG91_ENTITY_ID

  if (!apiKey) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "OTP service is not configured. Please contact support."
    )
  }

  if (!templateId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "SMS template is not configured. Please contact support."
    )
  }

  // Always prefix with country code 91 for India
  const mobile = `91${mobile10}`

  // MSG91 Flow API — DLT compliant
  // Pass OTP as VAR1 inside recipients so MSG91 substitutes it into the template
  const url = "https://control.msg91.com/api/v5/flow"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    authkey: apiKey,
  }

  const payload: Record<string, unknown> = {
    template_id: templateId,
    sender: senderId,
    short_url: "0",
    realTimeResponse: "1",
    recipients: [
      {
        mobiles: mobile,
        var: otp,
      },
    ],
  }

  if (entityId) {
    payload["pe_id"] = entityId
  }

  console.log("[Phone OTP] Sending via MSG91 DLT Flow API", {
    mobile,
    templateId,
    senderId,
    otp,
  })

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  console.log("[Phone OTP] MSG91 response:", response.status, responseText)

  let responseJson: Record<string, unknown> = {}
  try {
    responseJson = JSON.parse(responseText)
  } catch {
    // plain text — treat as success if HTTP 200
  }

  if (!response.ok || responseJson.type === "error") {
    const errMsg = (responseJson.message as string) || responseText || "Unknown error"
    console.error("[Phone OTP] Failed to send:", errMsg)
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Failed to send SMS OTP: ${errMsg}`
    )
  }

  console.log("[Phone OTP] MSG91 OTP sent successfully")
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
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

  const identifier = `phone:${cleanPhone}`
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

  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000)

  // Generate OTP locally and pass it to MSG91 Flow API
  const otp = generateOtp()

  await sendPhoneOtpViaMSG91(cleanPhone, otp)

  // Store the OTP locally for verification
  await otpService.createOtpRecords({
    customer_id: identifier,
    phone_number: cleanPhone,
    otp_code: otp,
    expires_at: expiresAt,
    attempts: 0,
    verified: false,
    locked_until: null,
  })

  res.json({
    success: true,
    message: "OTP sent to your mobile number",
    phone_number: cleanPhone,
  })
}
