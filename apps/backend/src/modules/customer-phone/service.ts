import { MedusaService } from "@medusajs/framework/utils"
import CustomerPhone from "./models/customer-phone"

class CustomerPhoneModuleService extends MedusaService({
  CustomerPhone,
}) {}

export default CustomerPhoneModuleService
