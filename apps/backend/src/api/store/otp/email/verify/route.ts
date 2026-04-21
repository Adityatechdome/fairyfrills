import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import OtpVerificationModuleService from "../../../../../modules/otp-verification/service"
import jwt from "jsonwebtoken"

const MAX_ATTEMPTS = 3
const LOCKOUT_MINUTES = 10

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { email, otp_code } = req.body as { email: string; otp_code: string }

  if (!email || !otp_code) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "email and otp_code are required"
    )
  }

  const normalizedEmail = email.trim().toLowerCase()
  const identifier = `email:${normalizedEmail}`
  const otpService: OtpVerificationModuleService = req.scope.resolve("otpVerification")
  const now = new Date()

  const records = await otpService.listOtpRecords(
    { customer_id: identifier, verified: false },
    { order: { created_at: "DESC" }, take: 1 }
  )

  if (!records.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No active OTP found. Please request a new one."
    )
  }

  const record = records[0]

  // Check lockout
  if (record.locked_until && new Date(record.locked_until) > now) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Too many attempts. Please try again after ${LOCKOUT_MINUTES} minutes.`
    )
  }

  // Check expiry
  if (new Date(record.expires_at) <= now) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "OTP expired. Please request a new one."
    )
  }

  // Compare OTP directly from DB (no MSG91 call needed for email)
  const isValid = record.otp_code === otp_code.trim()

  console.log("[Email OTP Verify] Comparing OTP:", { stored: record.otp_code, submitted: otp_code.trim(), match: isValid })

  if (!isValid) {
    const newAttempts = (record.attempts || 0) + 1
    const remaining = MAX_ATTEMPTS - newAttempts

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
      await otpService.updateOtpRecords({
        id: record.id,
        attempts: newAttempts,
        locked_until: lockedUntil,
      })
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Too many attempts. Please try again after ${LOCKOUT_MINUTES} minutes.`
      )
    }

    await otpService.updateOtpRecords({ id: record.id, attempts: newAttempts })

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Incorrect OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
    )
  }

  // Mark as verified
  await otpService.updateOtpRecords({ id: record.id, verified: true })

  // Find or create customer by email
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { email: normalizedEmail },
  })

  let customerId: string

  if (customers.length > 0) {
    customerId = customers[0].id
  } else {
    const customerModuleService = req.scope.resolve("customer")
    const customer = await customerModuleService.createCustomers({
      email: normalizedEmail,
    })
    customerId = customer.id
  }

  // Issue Medusa-compatible JWT
  const jwtSecret = process.env.JWT_SECRET || "supersecret"
  const token = jwt.sign(
    {
      actor_id: customerId,
      actor_type: "customer",
      auth_identity_id: customerId,
    },
    jwtSecret,
    { expiresIn: 7 * 24 * 60 * 60 }
  )

  res.json({
    success: true,
    token,
    customer: {
      id: customerId,
      email: normalizedEmail,
    },
  })
}
