import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { VTO_MODULE } from "../../../modules/vto"
import VtoModuleService from "../../../modules/vto/service"

type Input = {
  customer_id: string
  photo_url: string
}

export const createVtoUploadedPhotoStep = createStep(
  "create-vto-uploaded-photo",
  async (input: Input, { container }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vtoService = container.resolve(VTO_MODULE) as any

    const photo = await vtoService.createVtoUploadedPhotos({
      customer_id: input.customer_id,
      photo_url: input.photo_url,
    })

    return new StepResponse(photo, photo.id)
  },
  async (id, { container }) => {
    if (!id) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const vtoService = container.resolve(VTO_MODULE) as any
    await vtoService.deleteVtoUploadedPhotos(id)
  }
)
