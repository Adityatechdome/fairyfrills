import {
  AbstractFileProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { S3Client, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Readable, PassThrough } from "stream"
import path from "path"
import { randomUUID } from "crypto"

type R2FileOptions = {
  bucket: string
  endpoint: string
  access_key_id: string
  secret_access_key: string
  file_url: string
  prefix?: string
  region?: string
}

type InjectedDependencies = {
  logger: Logger
}

/**
 * Custom R2 file provider that uses @aws-sdk/lib-storage Upload (multipart)
 * instead of PutObjectCommand, which avoids the x-amz-checksum-* header
 * that Cloudflare R2 rejects with SignatureDoesNotMatch (AWS SDK v3 >= 3.600).
 */
class R2FileService extends AbstractFileProviderService {
  static identifier = "r2-custom"

  private client_: S3Client
  private config_: {
    bucket: string
    fileUrl: string
    prefix: string
    region: string
  }
  private logger_: Logger

  constructor({ logger }: InjectedDependencies, options: R2FileOptions) {
    super()

    if (!options.access_key_id || !options.secret_access_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "R2 access_key_id and secret_access_key are required"
      )
    }

    this.config_ = {
      bucket: options.bucket,
      fileUrl: options.file_url,
      prefix: options.prefix ?? "",
      region: options.region ?? "auto",
    }
    this.logger_ = logger

    this.client_ = new S3Client({
      credentials: {
        accessKeyId: options.access_key_id,
        secretAccessKey: options.secret_access_key,
      },
      endpoint: options.endpoint,
      region: this.config_.region,
      requestChecksumCalculation: "WHEN_REQUIRED" as any,
    })
  }

  async upload(file: {
    filename: string
    mimeType: string
    content: string
    access?: string
  }) {
    if (!file) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No file provided")
    }
    if (!file.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const parsed = path.parse(file.filename)
    const fileKey = `${this.config_.prefix}${parsed.name}-${randomUUID()}${parsed.ext}`

    let content: Buffer
    try {
      const decoded = Buffer.from(file.content, "base64")
      if (decoded.toString("base64") === file.content) {
        content = decoded
      } else {
        content = Buffer.from(file.content, "utf8")
      }
    } catch {
      content = Buffer.from(file.content, "binary")
    }

    // Use Upload (multipart) instead of PutObjectCommand to avoid the
    // x-amz-checksum-crc32 header that Cloudflare R2 rejects.
    const upload = new Upload({
      client: this.client_,
      params: {
        ACL: file.access === "public" ? "public-read" : "private",
        Bucket: this.config_.bucket,
        Key: fileKey,
        Body: Readable.from(content),
        ContentType: file.mimeType,
        CacheControl: "public, max-age=31536000",
        Metadata: {
          "original-filename": encodeURIComponent(file.filename),
        },
      },
    })

    try {
      await upload.done()
    } catch (e) {
      this.logger_.error(e)
      throw e
    }

    return {
      url: `${this.config_.fileUrl}/${encodeURIComponent(fileKey)}`,
      key: fileKey,
    }
  }

  async getUploadStream(fileData: {
    filename: string
    mimeType: string
    access?: string
  }) {
    if (!fileData.filename) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "No filename provided")
    }

    const parsed = path.parse(fileData.filename)
    const fileKey = `${this.config_.prefix}${parsed.name}-${randomUUID()}${parsed.ext}`
    const pass = new PassThrough()

    const upload = new Upload({
      client: this.client_,
      params: {
        ACL: fileData.access === "public" ? "public-read" : "private",
        Bucket: this.config_.bucket,
        Key: fileKey,
        Body: pass,
        ContentType: fileData.mimeType,
        CacheControl: "public, max-age=31536000",
        Metadata: {
          "original-filename": encodeURIComponent(fileData.filename),
        },
      },
    })

    const promise = upload.done().then(() => ({
      url: `${this.config_.fileUrl}/${fileKey}`,
      key: fileKey,
    }))

    return {
      writeStream: pass,
      promise,
      url: `${this.config_.fileUrl}/${fileKey}`,
      fileKey,
    }
  }

  async delete(files: { fileKey: string } | { fileKey: string }[]) {
    try {
      if (Array.isArray(files)) {
        await this.client_.send(
          new DeleteObjectsCommand({
            Bucket: this.config_.bucket,
            Delete: {
              Objects: files.map((f) => ({ Key: f.fileKey })),
              Quiet: true,
            },
          })
        )
      } else {
        await this.client_.send(
          new DeleteObjectCommand({
            Bucket: this.config_.bucket,
            Key: files.fileKey,
          })
        )
      }
    } catch (e) {
      this.logger_.error(e)
      throw e
    }
  }

  async getPresignedDownloadUrl({
    fileKey,
    expiresIn = 3600,
  }: {
    fileKey: string
    expiresIn?: number
  }) {
    const command = new GetObjectCommand({
      Bucket: this.config_.bucket,
      Key: fileKey,
    })
    return getSignedUrl(this.client_, command, { expiresIn })
  }
}

export default R2FileService
