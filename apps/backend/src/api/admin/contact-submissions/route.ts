import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const contactService = req.scope.resolve("contactSubmission")
    const submissions = await contactService.listContactSubmissions(
      {},
      { order: { created_at: "DESC" } }
    )
    console.log("[contact-submissions] GET returning", submissions.length, "items")
    res.json({ submissions })
  } catch (err) {
    console.error("[contact-submissions] GET error:", err)
    res.status(500).json({ error: String(err) })
  }
}
