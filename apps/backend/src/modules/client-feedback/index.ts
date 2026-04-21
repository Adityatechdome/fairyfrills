import ClientFeedbackService from "./service"
import { Module } from "@medusajs/framework/utils"

export const CLIENT_FEEDBACK_MODULE = "clientFeedback"

export default Module(CLIENT_FEEDBACK_MODULE, {
  service: ClientFeedbackService,
})
