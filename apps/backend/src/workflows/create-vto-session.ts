import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createVtoSessionStep } from "./steps/vto/create-vto-session"

type Input = {
  customer_id: string
  model_photo_url: string
  product_id?: string
  product_image_url: string
}

const createVtoSessionWorkflow = createWorkflow(
  "create-vto-session",
  function (input: Input) {
    const session = createVtoSessionStep(input)
    return new WorkflowResponse(session)
  }
)

export default createVtoSessionWorkflow
