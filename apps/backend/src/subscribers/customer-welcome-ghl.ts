import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function customerWelcomeGhlSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const siteSettingsService = container.resolve("siteSettings")

  const [settings] = await siteSettingsService.listSiteSettings({}, { take: 1 })
  const webhookUrl = settings?.ghl_welcome_webhook_url

  if (!webhookUrl) {
    console.warn("[GHL Welcome] GHL webhook URL is not configured in Site Settings, skipping.")
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "phone"],
    filters: { id: data.id },
  })

  const customer = customers[0]
  if (!customer) {
    console.warn("[GHL Welcome] Customer not found:", data.id)
    return
  }

  const payload = {
    email: customer.email,
    first_name: customer.first_name ?? "",
    last_name: customer.last_name ?? "",
    phone: customer.phone ?? "",
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    console.log(`[GHL Welcome] Webhook sent for ${customer.email} — status ${res.status}`)
  } catch (err) {
    console.error("[GHL Welcome] Failed to send webhook:", err)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
