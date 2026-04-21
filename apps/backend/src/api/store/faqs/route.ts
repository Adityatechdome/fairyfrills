import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const faqService = req.scope.resolve("faq")
  const faqs = await faqService.listFaqs(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  const grouped: Record<string, any[]> = {}
  for (const faq of faqs) {
    const cat = faq.category || "General"
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(faq)
  }

  res.json({ faqs: grouped })
}
