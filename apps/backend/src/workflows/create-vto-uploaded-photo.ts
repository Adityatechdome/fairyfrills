import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createVtoUploadedPhotoStep } from "./steps/vto/create-vto-uploaded-photo"

type Input = {
  customer_id: string
  photo_url: string
}

const createVtoUploadedPhotoWorkflow = createWorkflow(
  "create-vto-uploaded-photo",
  function (input: Input) {
    const photo = createVtoUploadedPhotoStep(input)
    return new WorkflowResponse(photo)
  }
)

export default createVtoUploadedPhotoWorkflow
