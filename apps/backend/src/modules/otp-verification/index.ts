import OtpVerificationModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const OTP_VERIFICATION_MODULE = "otpVerification"

export default Module(OTP_VERIFICATION_MODULE, {
  service: OtpVerificationModuleService,
})
