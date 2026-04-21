import { MedusaService } from "@medusajs/framework/utils"
import ContactSubmission from "./models/contact-submission"

class ContactSubmissionModuleService extends MedusaService({
  ContactSubmission,
}) {}

export default ContactSubmissionModuleService
