import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const testimonialService = req.scope.resolve("testimonial")
  const testimonials = await testimonialService.listTestimonials(
    {},
    { order: { order: "ASC" } }
  )
  res.json({ testimonials })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const testimonialService = req.scope.resolve("testimonial")
  const testimonial = await testimonialService.createTestimonials(req.body as any)
  res.json({ testimonial })
}
