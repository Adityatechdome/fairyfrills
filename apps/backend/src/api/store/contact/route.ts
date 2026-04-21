import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = req.body as any
  if (!body.first_name || !body.last_name || !body.email || !body.message) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "first_name, last_name, email, and message are required"
    )
  }

  const contactService = req.scope.resolve("contactSubmission")
  const submission = await contactService.createContactSubmissions({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    phone: body.phone || "",
    country: body.country || "",
    message: body.message,
    status: "new",
  })

  res.json({ submission })
}
