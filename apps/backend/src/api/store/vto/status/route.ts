import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import updateVtoSessionWorkflow from "../../../../workflows/update-vto-session"

async function fetchAndReupload(
  imageUrl: string,
  scope: Parameters<typeof uploadFilesWorkflow>[0],
  filename: string
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) throw new Error(`Failed to fetch result image: ${imgRes.status}`)

      const buffer = Buffer.from(await imgRes.arrayBuffer())
      const base64 = buffer.toString("base64")

      const contentType = imgRes.headers.get("content-type") || "image/jpeg"

      const { result } = await uploadFilesWorkflow(scope).run({
        input: {
          files: [
            {
              filename,
              mimeType: contentType,
              content: base64,
              access: "public",
            },
          ],
        },
      })

      return result[0].url
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  throw lastError || new Error("Failed to re-upload result image after 3 attempts")
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const taskId = req.query.task_id as string
  const sessionId = req.query.session_id as string

  if (!taskId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "task_id is required")
  }

  const klingApiKey = process.env.KLING_API_KEY
  if (!klingApiKey) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "VTO service not configured")
  }

  const klingRes = await fetch(`https://api.piapi.ai/api/v1/task/${taskId}`, {
    headers: { "x-api-key": klingApiKey },
  })

  const klingData = await klingRes.json() as {
    data?: {
      status?: string
      output?: { works?: { image?: { resource_without_watermark?: string } }[] }
      error?: { message?: string }
    }
    error?: { message?: string }
  }

  const taskStatus = klingData?.data?.status

  if (taskStatus === "completed" || taskStatus === "succeed") {
    // Extract result image URL from Kling response
    const klingImageUrl =
      klingData?.data?.output?.works?.[0]?.image?.resource_without_watermark

    if (!klingImageUrl) {
      if (sessionId) {
        await updateVtoSessionWorkflow(req.scope).run({
          input: { id: sessionId, status: "failed", error_message: "No result image returned" },
        })
      }
      return res.json({ status: "failed", error: "No result image returned" })
    }

    // Re-upload result to R2
    let permanentUrl: string
    try {
      permanentUrl = await fetchAndReupload(
        klingImageUrl,
        req.scope,
        `vto-result-${taskId}-${Date.now()}.jpg`
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save result image"
      if (sessionId) {
        await updateVtoSessionWorkflow(req.scope).run({
          input: { id: sessionId, status: "failed", error_message: msg },
        })
      }
      return res.json({ status: "failed", error: msg })
    }

    // Update session
    if (sessionId) {
      await updateVtoSessionWorkflow(req.scope).run({
        input: {
          id: sessionId,
          status: "completed",
          result_image_url: permanentUrl,
          completed_at: new Date(),
        },
      })
    }

    return res.json({ status: "completed", result_image_url: permanentUrl })
  }

  if (taskStatus === "failed" || taskStatus === "error") {
    const errMsg = klingData?.data?.error?.message || "VTO task failed"
    if (sessionId) {
      await updateVtoSessionWorkflow(req.scope).run({
        input: { id: sessionId, status: "failed", error_message: errMsg },
      })
    }
    return res.json({ status: "failed", error: errMsg })
  }

  // Still processing
  return res.json({ status: "processing" })
}
