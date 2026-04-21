import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import createVtoUploadedPhotoWorkflow from "../../../../workflows/create-vto-uploaded-photo"
import sharp from "sharp"

const MIN_DIMENSION = 512
const MAX_DIMENSION = 4096

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Authentication required")
  }

  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file uploaded")
  }

  const file = files[0]

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.mimetype)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only JPG, PNG, and WebP files are allowed")
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "File must be under 10MB")
  }

  // Read original dimensions
  const metadata = await sharp(file.buffer).metadata()
  let { width = 0, height = 0 } = metadata

  let imageBuffer = file.buffer

  // Step 1: Downscale if either dimension exceeds MAX_DIMENSION
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    // fit: "inside" shrinks so both dims fit within MAX_DIMENSION box
    imageBuffer = await sharp(imageBuffer)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    const meta = await sharp(imageBuffer).metadata()
    width = meta.width ?? width
    height = meta.height ?? height
  }

  // Step 2: Upscale if either dimension is below MIN_DIMENSION.
  // fit: "outside" ensures BOTH dimensions end up >= the target,
  // so a 300x800 image becomes 512x1365 (not 192x512).
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    imageBuffer = await sharp(imageBuffer)
      .resize({
        width: MIN_DIMENSION,
        height: MIN_DIMENSION,
        fit: "outside",      // <-- key: enlarges until BOTH sides >= 512
        withoutEnlargement: false,
      })
      .jpeg({ quality: 90 })
      .toBuffer()

    const meta = await sharp(imageBuffer).metadata()
    width = meta.width ?? 0
    height = meta.height ?? 0
  }

  // Final safety check — both dimensions must be >= 512
  if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
    return res.status(400).json({
      message: "Your photo must be at least 512x512 pixels. Please use a higher resolution image.",
    })
  }

  // Upload to R2 via Medusa file module (always as JPEG for consistency)
  const { result: uploadResult } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: [
        {
          filename: `vto-photo-${customerId}-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          content: imageBuffer.toString("base64"),
          access: "public",
        },
      ],
    },
  })

  const photoUrl = uploadResult[0].url

  // Save to DB
  const { result: photo } = await createVtoUploadedPhotoWorkflow(req.scope).run({
    input: {
      customer_id: customerId,
      photo_url: photoUrl,
    },
  })

  return res.json({ photo_url: photoUrl, photo_id: photo.id })
}
