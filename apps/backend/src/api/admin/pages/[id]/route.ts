import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  const page = await contentPageService.retrieveContentPage(req.params.id)
  res.json({ page })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  const page = await contentPageService.updateContentPages({
    id: req.params.id,
    ...(req.body as any),
  })
  res.json({ page })
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  await contentPageService.deleteContentPages(req.params.id)
  res.json({ id: req.params.id, deleted: true })
}
