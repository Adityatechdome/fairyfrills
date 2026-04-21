import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import createVtoSessionWorkflow from "../../../../workflows/create-vto-session"
import updateVtoSessionWorkflow from "../../../../workflows/update-vto-session"
import sharp from "sharp"

const MIN_DIMENSION = 512
const MAX_DIMENSION = 4096

type SubmitBody = {
  model_photo_url: string
  product_image_url: string
  product_id?: string
  garment_type?: "upper" | "lower" | "dress"
}

/**
 * Fetches an image URL, resizes it so both dimensions are >= 512px
 * and <= 4096px, then re-uploads to R2 and returns the new URL.
 * If the image already meets requirements, the original URL is returned as-is.
 */
async function ensureImageDimensions(
  imageUrl: string,
  scope: AuthenticatedMedusaRequest["scope"],
  label: string
): Promise<string> {
  // Fetch the image
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Could not fetch ${label} image`)
  }
  const arrayBuffer = await response.arrayBuffer()
  let buffer = Buffer.from(arrayBuffer)

  const meta = await sharp(buffer).metadata()
  let { width = 0, height = 0 } = meta

  // Already fine — skip processing
  if (width >= MIN_DIMENSION && height >= MIN_DIMENSION && width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
    return imageUrl
  }

  // Downscale if too large
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    buffer = await sharp(buffer)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer()
    const m = await sharp(buffer).metadata()
    width = m.width ?? width
    height = m.height ?? height
  }

  // Upscale if too small — fit: "outside" guarantees BOTH sides >= MIN_DIMENSION
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    buffer = await sharp(buffer)
      .resize({ width: MIN_DIMENSION, height: MIN_DIMENSION, fit: "outside", withoutEnlargement: false })
      .jpeg({ quality: 90 })
      .toBuffer()
  }

  // Re-upload processed image to R2
  const { result: uploadResult } = await uploadFilesWorkflow(scope).run({
    input: {
      files: [
        {
          filename: `vto-${label}-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          content: buffer.toString("base64"),
          access: "public",
        },
      ],
    },
  })

  return uploadResult[0].url
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const { model_photo_url, product_image_url, product_id, garment_type } =
    (req.body ?? req.validatedBody ?? {}) as SubmitBody

  if (!model_photo_url || !product_image_url) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "model_photo_url and product_image_url are required")
  }

  // Ensure both images meet Kling's 512px minimum requirement
  const [safeModelUrl, safeProductUrl] = await Promise.all([
    ensureImageDimensions(model_photo_url, req.scope, "model"),
    ensureImageDimensions(product_image_url, req.scope, "product"),
  ])

  // Create session in DB
  const { result: session } = await createVtoSessionWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      model_photo_url: safeModelUrl,
      product_image_url: safeProductUrl,
      product_id: product_id ?? undefined,
    },
  })

  // Build Kling input based on garment_type
  const klingInput: Record<string, unknown> = {
    model_input: safeModelUrl,
    batch_size: 1,
  }

  if (garment_type === "upper") {
    klingInput.upper_input = safeProductUrl
  } else if (garment_type === "lower") {
    klingInput.lower_input = safeProductUrl
  } else {
    klingInput.dress_input = safeProductUrl
  }

  // Call Kling API
  const klingApiKey = process.env.KLING_API_KEY
  if (!klingApiKey) {
    await updateVtoSessionWorkflow(req.scope).run({
      input: { id: session.id, status: "failed", error_message: "VTO service not configured" },
    })
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "VTO service not configured")
  }

  let klingTaskId: string

  try {
    const klingRes = await fetch("https://api.piapi.ai/api/v1/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": klingApiKey,
      },
      body: JSON.stringify({
        model: "kling",
        task_type: "ai_try_on",
        input: klingInput,
        config: { service_mode: "public" },
      }),
    })

    const klingData = await klingRes.json() as { data?: { task_id?: string }; error?: { message?: string } }

    if (!klingRes.ok || !klingData?.data?.task_id) {
      throw new Error(klingData?.error?.message || "Kling API error")
    }

    klingTaskId = klingData.data.task_id
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to contact VTO service"
    await updateVtoSessionWorkflow(req.scope).run({
      input: { id: session.id, status: "failed", error_message: msg },
    })
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, msg)
  }

  // Update session with Kling task ID + processing status
  await updateVtoSessionWorkflow(req.scope).run({
    input: {
      id: session.id,
      kling_task_id: klingTaskId,
      status: "processing",
    },
  })

  return res.json({ task_id: klingTaskId, session_id: session.id })
}
