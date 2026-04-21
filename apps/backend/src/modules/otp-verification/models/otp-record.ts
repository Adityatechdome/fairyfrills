import { model } from "@medusajs/framework/utils"

const OtpRecord = model.define("otp_record", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  phone_number: model.text(),
  otp_code: model.text(),
  expires_at: model.dateTime(),
  attempts: model.number().default(0),
  verified: model.boolean().default(false),
  locked_until: model.dateTime().nullable(),
})

export default OtpRecord
