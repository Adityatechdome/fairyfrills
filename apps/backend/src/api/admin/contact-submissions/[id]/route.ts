import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const contactService = req.scope.resolve("contactSubmission")
  const submission = await contactService.updateContactSubmissions({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ submission })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const contactService = req.scope.resolve("contactSubmission")
  await contactService.deleteContactSubmissions(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
