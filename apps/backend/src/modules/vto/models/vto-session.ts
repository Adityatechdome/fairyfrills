import { model } from "@medusajs/framework/utils"

const VtoSession = model.define("vto_session", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  model_photo_url: model.text(),
  product_id: model.text().nullable(),
  product_image_url: model.text(),
  kling_task_id: model.text().nullable(),
  status: model.enum(["pending", "processing", "completed", "failed", "timed_out", "abandoned"]).default("pending"),
  result_image_url: model.text().nullable(),
  error_message: model.text().nullable(),
  completed_at: model.dateTime().nullable(),
  saved: model.boolean().default(false),
})

export default VtoSession
