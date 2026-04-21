import { MedusaService } from "@medusajs/framework/utils"
import Faq from "./models/faq"

class FaqModuleService extends MedusaService({
  Faq,
}) {}

export default FaqModuleService
