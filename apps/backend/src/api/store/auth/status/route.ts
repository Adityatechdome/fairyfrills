import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CustomerPhoneModuleService from "../../../../modules/customer-phone/service"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    return res.json({
      is_logged_in: false,
      phone_verified: false,
      phone_number: null,
    })
  }

  const customerPhoneService: CustomerPhoneModuleService = req.scope.resolve("customerPhone")

  const phones = await customerPhoneService.listCustomerPhones({
    customer_id: customerId,
  })

  const phoneRecord = phones[0] || null

  return res.json({
    is_logged_in: true,
    phone_verified: phoneRecord?.phone_verified ?? false,
    phone_number: phoneRecord?.phone_number ?? null,
  })
}
