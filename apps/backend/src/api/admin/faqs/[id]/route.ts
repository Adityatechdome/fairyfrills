import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const faqService = req.scope.resolve("faq")
  const faq = await faqService.updateFaqs({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ faq })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const faqService = req.scope.resolve("faq")
  await faqService.deleteFaqs(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
