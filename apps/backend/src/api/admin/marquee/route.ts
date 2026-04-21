import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const marqueeService = req.scope.resolve("marquee")
  const marquees = await marqueeService.listMarquees()
  res.json({ marquee: marquees[0] || null })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const marqueeService = req.scope.resolve("marquee")
  const marquees = await marqueeService.listMarquees()
  let marquee
  if (marquees.length > 0) {
    marquee = await marqueeService.updateMarquees({
      id: marquees[0].id,
      ...(req.body as any),
    })
  } else {
    marquee = await marqueeService.createMarquees(req.body as any)
  }
  res.json({ marquee })
}
