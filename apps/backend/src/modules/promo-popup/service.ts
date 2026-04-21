import { MedusaService } from "@medusajs/framework/utils"
import PromoPopup from "./models/promo-popup"

class PromoPopupModuleService extends MedusaService({
  PromoPopup,
}) {}

export default PromoPopupModuleService
