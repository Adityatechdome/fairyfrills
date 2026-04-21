import { MedusaService } from "@medusajs/framework/utils"
import OtpRecord from "./models/otp-record"

class OtpVerificationModuleService extends MedusaService({
  OtpRecord,
}) {}

export default OtpVerificationModuleService
