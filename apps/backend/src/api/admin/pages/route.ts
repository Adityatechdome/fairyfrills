import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  const pages = await contentPageService.listContentPages(
    {},
    { order: { slug: "ASC" } }
  )
  res.json({ pages })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  const page = await contentPageService.createContentPages(req.body as any)
  res.json({ page })
}
