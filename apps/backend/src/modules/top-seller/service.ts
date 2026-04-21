import { MedusaService } from "@medusajs/framework/utils"
import TopSeller from "./models/top-seller"

class TopSellerModuleService extends MedusaService({
  TopSeller,
}) {}

export default TopSellerModuleService
