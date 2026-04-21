import { MedusaService } from "@medusajs/framework/utils"
import VtoSession from "./models/vto-session"
import VtoUploadedPhoto from "./models/vto-uploaded-photo"

class VtoModuleService extends MedusaService({
  VtoSession,
  VtoUploadedPhoto,
}) {}

export default VtoModuleService
