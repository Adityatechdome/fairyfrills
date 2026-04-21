import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const marqueeService = req.scope.resolve("marquee")

  const marquees = await marqueeService.listMarquees(
    { is_active: true }
  )

  const marquee = marquees[0] || null

  return res.json({ marquee })
}
