import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VTO_MODULE } from "../../../../modules/vto"
import VtoModuleService from "../../../../modules/vto/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const vtoService: VtoModuleService = req.scope.resolve(VTO_MODULE)

  const sessions = await vtoService.listVtoSessions(
    { customer_id: customerId },
    { order: { created_at: "DESC" }, take: 20 }
  )

  return res.json({ sessions })
}

export async function DELETE(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const vtoService: VtoModuleService = req.scope.resolve(VTO_MODULE)

  // List all sessions for this customer then soft delete them
  const sessions = await vtoService.listVtoSessions({ customer_id: customerId })

  if (sessions.length > 0) {
    const ids = sessions.map((s) => s.id)
    await vtoService.softDeleteVtoSessions(ids)
  }

  return res.json({ success: true })
}
