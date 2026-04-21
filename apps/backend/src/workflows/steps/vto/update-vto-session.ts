import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VTO_MODULE } from "../../../modules/vto"
import VtoModuleService from "../../../modules/vto/service"

type Input = {
  id: string
  kling_task_id?: string
  status?: "pending" | "processing" | "completed" | "failed" | "timed_out" | "abandoned"
  result_image_url?: string
  error_message?: string
  completed_at?: Date
  saved?: boolean
}

export const updateVtoSessionStep = createStep(
  "update-vto-session",
  async (input: Input, { container }) => {
    const vtoService: VtoModuleService = container.resolve(VTO_MODULE)

    const { id, ...data } = input
    const session = await vtoService.updateVtoSessions({ id, ...data })

    return new StepResponse(session)
  }
)
