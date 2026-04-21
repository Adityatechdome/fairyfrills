import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { VTO_MODULE } from "../../../modules/vto"
import VtoModuleService from "../../../modules/vto/service"
import { Modules } from "@medusajs/framework/utils"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const vtoService: VtoModuleService = req.scope.resolve(VTO_MODULE)
  const customerModuleService = req.scope.resolve(Modules.CUSTOMER)

  const limit = parseInt((req.query.limit as string) || "50")
  const offset = parseInt((req.query.offset as string) || "0")
  const statusFilter = req.query.status as string | undefined

  const filters: Record<string, unknown> = {}
  if (statusFilter) {
    filters.status = statusFilter
  }

  const sessions = await vtoService.listVtoSessions(filters, {
    order: { created_at: "DESC" },
    take: limit,
    skip: offset,
  })

  const totalSessions = await vtoService.listVtoSessions(filters)
  const count = totalSessions.length

  // Fetch unique customer details
  const customerIds = [...new Set(sessions.map((s) => s.customer_id).filter(Boolean))]
  
  let customerMap: Record<string, { first_name?: string; last_name?: string; email?: string }> = {}
  if (customerIds.length > 0) {
    try {
      const customers = await customerModuleService.listCustomers({
        id: customerIds,
      })
      for (const c of customers) {
        customerMap[c.id] = {
          first_name: c.first_name ?? undefined,
          last_name: c.last_name ?? undefined,
          email: c.email ?? undefined,
        }
      }
    } catch {
      // silently fail — customer data is supplementary
    }
  }

  const enriched = sessions.map((s) => {
    const c = customerMap[s.customer_id] || {}
    const nameParts = [c.first_name, c.last_name].filter(Boolean)
    return {
      ...s,
      customer_name: nameParts.length > 0 ? nameParts.join(" ") : null,
      customer_email: c.email || null,
    }
  })

  return res.json({ sessions: enriched, count, limit, offset })
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.query as { id?: string }

  if (!id) {
    return res.status(400).json({ message: "Session id is required" })
  }

  const vtoService: VtoModuleService = req.scope.resolve(VTO_MODULE)
  await vtoService.deleteVtoSessions(id)

  return res.json({ deleted: true, id })
}
