import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VTO_MODULE } from "../../../modules/vto"
import VtoModuleService from "../../../modules/vto/service"

type Input = {
  customer_id: string
  model_photo_url: string
  product_id?: string
  product_image_url: string
}

export const createVtoSessionStep = createStep(
  "create-vto-session",
  async (input: Input, { container }) => {
    const vtoService: VtoModuleService = container.resolve(VTO_MODULE)

    const session = await vtoService.createVtoSessions({
      customer_id: input.customer_id,
      model_photo_url: input.model_photo_url,
      product_id: input.product_id ?? null,
      product_image_url: input.product_image_url,
      status: "pending",
    })

    return new StepResponse(session, session.id)
  },
  async (id, { container }) => {
    if (!id) return
    const vtoService: VtoModuleService = container.resolve(VTO_MODULE)
    await vtoService.deleteVtoSessions(id)
  }
)
