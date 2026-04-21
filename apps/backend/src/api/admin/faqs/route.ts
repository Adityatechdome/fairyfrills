import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const faqService = req.scope.resolve("faq")
  const faqs = await faqService.listFaqs(
    {},
    { order: { category: "ASC", sort_order: "ASC" } }
  )
  res.json({ faqs })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const faqService = req.scope.resolve("faq")
  const faq = await faqService.createFaqs(req.body as any)
  res.json({ faq })
}
