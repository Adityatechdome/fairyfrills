import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateVtoSessionStep } from "./steps/vto/update-vto-session"

type Input = {
  id: string
  kling_task_id?: string
  status?: "pending" | "processing" | "completed" | "failed" | "timed_out" | "abandoned"
  result_image_url?: string
  error_message?: string
  completed_at?: Date
  saved?: boolean
}

const updateVtoSessionWorkflow = createWorkflow(
  "update-vto-session",
  function (input: Input) {
    const session = updateVtoSessionStep(input)
    return new WorkflowResponse(session)
  }
)

export default updateVtoSessionWorkflow
