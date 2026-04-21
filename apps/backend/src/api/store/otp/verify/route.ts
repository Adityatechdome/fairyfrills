import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import OtpVerificationModuleService from "../../../../modules/otp-verification/service"
import CustomerPhoneModuleService from "../../../../modules/customer-phone/service"

const MAX_ATTEMPTS = 3
const LOCKOUT_MINUTES = 10

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const { phone_number, otp_code } = req.body as {
    phone_number: string
    otp_code: string
  }

  if (!phone_number || !otp_code) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "phone_number and otp_code are required"
    )
  }

  const cleanPhone = phone_number.replace(/\D/g, "")
  const otpService: OtpVerificationModuleService = req.scope.resolve("otpVerification")
  const now = new Date()

  const records = await otpService.listOtpRecords(
    {
      customer_id: customerId,
      phone_number: cleanPhone,
      verified: false,
    },
    { order: { created_at: "DESC" }, take: 1 }
  )

  if (!records.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No active OTP found. Please request a new one."
    )
  }

  const record = records[0]

  if (record.locked_until && new Date(record.locked_until) > now) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Too many attempts. Please try again after ${LOCKOUT_MINUTES} minutes.`
    )
  }

  if (new Date(record.expires_at) <= now) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "OTP expired. Please request a new one."
    )
  }

  if (record.otp_code !== otp_code) {
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

  await otpService.updateOtpRecords({ id: record.id, verified: true })

  const customerPhoneService: CustomerPhoneModuleService = req.scope.resolve("customerPhone")
  const link = req.scope.resolve("link")

  const existingPhones = await customerPhoneService.listCustomerPhones({
    customer_id: customerId,
  })

  if (existingPhones.length > 0) {
    await customerPhoneService.updateCustomerPhones({
      id: existingPhones[0].id,
      phone_number: cleanPhone,
      phone_verified: true,
    })
  } else {
    const customerPhone = await customerPhoneService.createCustomerPhones({
      customer_id: customerId,
      phone_number: cleanPhone,
      phone_verified: true,
    })

    await link.create({
      customerModule: {
        customer_id: customerId,
      },
      customerPhone: {
        customer_phone_id: customerPhone.id,
      },
    })
  }

  res.json({
    success: true,
    verified: true,
    phone_number: cleanPhone,
  })
}
