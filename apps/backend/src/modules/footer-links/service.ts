import { MedusaService } from "@medusajs/framework/utils"
import FooterLink from "./models/footer-link"

class FooterLinksModuleService extends MedusaService({
  FooterLink,
}) {}

export default FooterLinksModuleService
