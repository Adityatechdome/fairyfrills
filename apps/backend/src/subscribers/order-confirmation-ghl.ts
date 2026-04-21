import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function orderConfirmationGhlSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  console.log(`[GHL Order] order.placed event received for order: ${data.id}`)

  const siteSettingsService = container.resolve("siteSettings") as any

  const [settings] = await siteSettingsService.listSiteSettings({}, { take: 1 })
  const webhookUrl = settings?.ghl_order_webhook_url

  if (!webhookUrl) {
    console.warn("[GHL Order] GHL order webhook URL is not configured in Site Settings, skipping.")
    return
  }

  console.log(`[GHL Order] Webhook URL found, querying order ${data.id}...`)

  // Wait 2 seconds to ensure the order is fully committed to the DB before querying
  await sleep(2000)

  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let order: any = null

  // Retry up to 3 times in case the order is not yet available
  for (let attempt = 1; attempt <= 3; attempt++) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "status",
        "email",
        "currency_code",
        "total",
        "subtotal",
        "shipping_total",
        "tax_total",
        "created_at",
        "shipping_address.*",
        "customer.*",
        "items.*",
        "items.product.*",
      ],
      filters: { id: data.id },
    })

    order = orders[0]

    if (order) {
      console.log(`[GHL Order] Order found on attempt ${attempt}: #${order.display_id}`)
      break
    }

    console.warn(`[GHL Order] Order not found on attempt ${attempt}, retrying in 3s...`)
    await sleep(3000)
  }

  if (!order) {
    console.error(`[GHL Order] Order ${data.id} not found after 3 attempts — aborting webhook.`)
    return
  }

  const firstName = order.shipping_address?.first_name ?? order.customer?.first_name ?? ""
  const lastName = order.shipping_address?.last_name ?? order.customer?.last_name ?? ""
  const phone = order.shipping_address?.phone ?? order.customer?.phone ?? ""

  const itemLines = (order.items ?? []).map((item: any) => {
    return `${item.title} × ${item.quantity}`
  }).join(", ")

  const payload = {
    order_id: order.id,
    order_display_id: `#${order.display_id}`,
    email: order.email,
    first_name: firstName,
    last_name: lastName,
    phone,
    order_total: (order.total ?? 0).toFixed(2),
    order_subtotal: (order.subtotal ?? 0).toFixed(2),
    order_shipping: (order.shipping_total ?? 0).toFixed(2),
    order_tax: (order.tax_total ?? 0).toFixed(2),
    currency: (order.currency_code ?? "inr").toUpperCase(),
    items_summary: itemLines,
    items_count: (order.items ?? []).length,
    shipping_address_line1: order.shipping_address?.address_1 ?? "",
    shipping_address_city: order.shipping_address?.city ?? "",
    shipping_address_state: order.shipping_address?.province ?? "",
    shipping_address_postal: order.shipping_address?.postal_code ?? "",
    shipping_address_country: order.shipping_address?.country_code?.toUpperCase() ?? "",
    order_date: order.created_at,
  }

  console.log(`[GHL Order] Sending webhook to GHL for order #${order.display_id} (${order.email})...`)
  console.log(`[GHL Order] Payload: ${JSON.stringify(payload)}`)

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseText = await res.text()
    console.log(`[GHL Order] Webhook response for order #${order.display_id} — HTTP ${res.status}: ${responseText}`)

    if (!res.ok) {
      console.error(`[GHL Order] Webhook returned non-OK status ${res.status} for order #${order.display_id}`)
    }
  } catch (err) {
    console.error("[GHL Order] Failed to send webhook — network/fetch error:", err)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
