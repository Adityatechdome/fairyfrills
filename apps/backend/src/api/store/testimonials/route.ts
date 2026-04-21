import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const testimonialService = req.scope.resolve("testimonial")

  const testimonials = await testimonialService.listTestimonials(
    { is_active: true },
    { order: { order: "ASC" } }
  )

  // If testimonials have product_ids, fetch the product data
  const query = req.scope.resolve("query")
  const productIds = testimonials
    .map((t: any) => t.product_id)
    .filter(Boolean)

  let productsMap: Record<string, any> = {}

  if (productIds.length > 0) {
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle", "thumbnail", "variants.calculated_price.*"],
      filters: { id: productIds },
    })

    productsMap = products.reduce((acc: Record<string, any>, p: any) => {
      acc[p.id] = p
      return acc
    }, {})
  }

  const enrichedTestimonials = testimonials.map((t: any) => ({
    ...t,
    product: t.product_id ? productsMap[t.product_id] || null : null,
  }))

  return res.json({ testimonials: enrichedTestimonials })
}
