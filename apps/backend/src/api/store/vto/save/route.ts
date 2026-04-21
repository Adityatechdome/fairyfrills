import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { VTO_MODULE } from "../../../../modules/vto"
import VtoModuleService from "../../../../modules/vto/service"
import updateVtoSessionWorkflow from "../../../../workflows/update-vto-session"

type SaveBody = {
  session_id: string
  saved: boolean
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const { session_id, saved } = req.validatedBody as SaveBody

  if (!session_id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "session_id is required")
  }

  // Verify session belongs to customer
  const vtoService: VtoModuleService = req.scope.resolve(VTO_MODULE)
  const [session] = await vtoService.listVtoSessions({
    id: session_id,
    customer_id: customerId,
  })

  if (!session) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Session not found")
  }

  await updateVtoSessionWorkflow(req.scope).run({
    input: { id: session_id, saved: saved ?? true },
  })

  return res.json({ success: true })
}
