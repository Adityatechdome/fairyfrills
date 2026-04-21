import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const testimonialService = req.scope.resolve("testimonial")
  const testimonial = await testimonialService.updateTestimonials({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ testimonial })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const testimonialService = req.scope.resolve("testimonial")
  await testimonialService.deleteTestimonials(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
