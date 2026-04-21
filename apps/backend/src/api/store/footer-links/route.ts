import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const footerLinksService = req.scope.resolve("footerLinks")

  const links = await footerLinksService.listFooterLinks(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  const company_info = links.filter(
    (l: any) => l.column === "company_info"
  )
  const company_policies = links.filter(
    (l: any) => l.column === "company_policies"
  )

  return res.json({ company_info, company_policies })
}
