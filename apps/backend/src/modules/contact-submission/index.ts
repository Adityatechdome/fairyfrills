import ContactSubmissionModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CONTACT_SUBMISSION_MODULE = "contactSubmission"

export default Module(CONTACT_SUBMISSION_MODULE, {
  service: ContactSubmissionModuleService,
})
