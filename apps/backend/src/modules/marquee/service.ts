import { MedusaService } from "@medusajs/framework/utils"
import Marquee from "./models/marquee"

class MarqueeModuleService extends MedusaService({
  Marquee,
}) {}

export default MarqueeModuleService
