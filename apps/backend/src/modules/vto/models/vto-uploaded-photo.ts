import { model } from "@medusajs/framework/utils"

const VtoUploadedPhoto = model.define("vto_uploaded_photo", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  photo_url: model.text(),
})

export default VtoUploadedPhoto
