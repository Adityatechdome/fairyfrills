import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const contentPageService = req.scope.resolve("contentPage")
  const [page] = await contentPageService.listContentPages(
    { slug: req.params.slug, is_active: true },
    { take: 1 }
  )

  if (!page) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Page not found")
  }

  res.json({ page })
}
