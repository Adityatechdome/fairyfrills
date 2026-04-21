import {
  AbstractPaymentProvider,
  PaymentActions,
  BigNumber,
} from "@medusajs/framework/utils"
import type {
  Logger,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  ProviderWebhookPayload,
  WebhookActionResult,
  PaymentSessionStatus,
} from "@medusajs/framework/types"
import Razorpay from "razorpay"
import crypto from "crypto"

type RazorpayOptions = {
  key_id: string
  key_secret: string
  webhook_secret?: string
  auto_capture?: boolean
}

type InjectedDependencies = {
  logger: Logger
}

class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static identifier = "razorpay"

  protected logger_: Logger
  protected options_: RazorpayOptions
  protected razorpay_: InstanceType<typeof Razorpay> | null = null

  constructor(
    { logger }: InjectedDependencies,
    options: RazorpayOptions
  ) {
    // @ts-ignore
    super(...arguments)

    this.logger_ = logger

    // Options from medusa-config may be empty strings if env vars weren't
    // available at config load time. Fall back to reading env vars directly.
    const keyId = options.key_id || process.env.RAZORPAY_KEY_ID || ""
    const keySecret = options.key_secret || process.env.RAZORPAY_KEY_SECRET || ""
    const webhookSecret = options.webhook_secret || process.env.RAZORPAY_WEBHOOK_SECRET || ""

    this.options_ = {
      ...options,
      key_id: keyId,
      key_secret: keySecret,
      webhook_secret: webhookSecret,
    }

    if (keyId && keySecret) {
      this.razorpay_ = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      })
      this.logger_.info("Razorpay payment provider initialized successfully")
    } else {
      this.logger_.warn(
        "Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET env vars."
      )
    }
  }

  private getRazorpayClient(): InstanceType<typeof Razorpay> {
    if (!this.razorpay_) {
      throw new Error(
        "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables."
      )
    }
    return this.razorpay_
  }

  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code } = input
    // Medusa passes the payment session ID in input.data.session_id
    // We store it in Razorpay order notes so we can recover it in webhooks
    const medusaSessionId = (input.data?.session_id as string) || ""

    try {
      const client = this.getRazorpayClient()
      const order = await (client.orders.create as Function)({
        amount: Math.round(new BigNumber(amount).numeric * 100),
        currency: currency_code.toUpperCase(),
        receipt: `receipt_${Date.now()}`,
        payment_capture: this.options_.auto_capture !== false ? 1 : 0,
        notes: {
          medusa_session_id: medusaSessionId,
        },
      })

      this.logger_.info(`Razorpay order created: ${order.id}, session: ${medusaSessionId}`)

      return {
        id: order.id,
        data: {
          razorpay_order_id: order.id,
          razorpay_key_id: this.options_.key_id,
          amount: order.amount,
          currency: order.currency,
          // Keep the session ID in session data as a fallback
          session_id: medusaSessionId,
        },
      }
    } catch (error: any) {
      this.logger_.error(`Razorpay initiatePayment error: ${error.message}`)
      throw error
    }
  }

  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const razorpayOrderId = input.data?.razorpay_order_id as string
    const razorpayPaymentId = input.data?.razorpay_payment_id as string
    const razorpaySignature = input.data?.razorpay_signature as string

    if (!razorpayPaymentId || !razorpaySignature) {
      return {
        status: "authorized" as PaymentSessionStatus,
        data: {
          ...input.data,
        },
      }
    }

    try {
      const expectedSignature = crypto
        .createHmac("sha256", this.options_.key_secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex")

      if (expectedSignature !== razorpaySignature) {
        this.logger_.error("Razorpay signature verification failed")
        throw new Error("Payment signature verification failed")
      }

      this.logger_.info(`Razorpay payment authorized: ${razorpayPaymentId}`)

      return {
        status: "authorized" as PaymentSessionStatus,
        data: {
          ...input.data,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
        },
      }
    } catch (error: any) {
      this.logger_.error(`Razorpay authorizePayment error: ${error.message}`)
      throw error
    }
  }

  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const razorpayPaymentId = input.data?.razorpay_payment_id as string

    try {
      const client = this.getRazorpayClient()
      const payment = await (client.payments.fetch as Function)(razorpayPaymentId)

      if (payment.status === "captured") {
        return {
          data: {
            ...input.data,
            captured: true,
          },
        }
      }

      await (client.payments.capture as Function)(
        razorpayPaymentId,
        payment.amount,
        payment.currency
      )

      this.logger_.info(`Razorpay payment captured: ${razorpayPaymentId}`)

      return {
        data: {
          ...input.data,
          captured: true,
        },
      }
    } catch (error: any) {
      this.logger_.error(`Razorpay capturePayment error: ${error.message}`)
      throw error
    }
  }

  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    return {
      data: input.data,
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return {
      data: input.data,
    }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const razorpayPaymentId = input.data?.razorpay_payment_id as string

    try {
      const client = this.getRazorpayClient()
      const refund = await (client.payments.refund as Function)(razorpayPaymentId, {
        amount: Math.round(new BigNumber(input.amount).numeric * 100),
      })

      this.logger_.info(
        `Razorpay refund created: ${refund.id} for payment ${razorpayPaymentId}`
      )

      return {
        data: {
          ...input.data,
          refund_id: refund.id,
        },
      }
    } catch (error: any) {
      this.logger_.error(`Razorpay refundPayment error: ${error.message}`)
      throw error
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const razorpayOrderId = input.data?.razorpay_order_id as string

    try {
      const client = this.getRazorpayClient()
      const order = await (client.orders.fetch as Function)(razorpayOrderId)
      return {
        data: {
          ...input.data,
          order_status: order.status,
        },
      }
    } catch (error: any) {
      this.logger_.error(`Razorpay retrievePayment error: ${error.message}`)
      return { data: input.data }
    }
  }

  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    return this.initiatePayment(input)
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const razorpayPaymentId = input.data?.razorpay_payment_id as string

    if (!razorpayPaymentId) {
      return { status: "pending" as PaymentSessionStatus }
    }

    try {
      const client = this.getRazorpayClient()
      const payment = await (client.payments.fetch as Function)(razorpayPaymentId)

      switch (payment.status) {
        case "captured":
          return { status: "authorized" as PaymentSessionStatus }
        case "authorized":
          return { status: "authorized" as PaymentSessionStatus }
        case "refunded":
          return { status: "authorized" as PaymentSessionStatus }
        case "failed":
          return { status: "error" as PaymentSessionStatus }
        default:
          return { status: "pending" as PaymentSessionStatus }
      }
    } catch {
      return { status: "pending" as PaymentSessionStatus }
    }
  }

  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const { data, rawData, headers } = payload
    const signature = (headers as any)?.["x-razorpay-signature"] as string
    const webhookSecret = this.options_.webhook_secret

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawData as string)
        .digest("hex")

      if (expectedSignature !== signature) {
        throw new Error("Razorpay webhook signature verification failed")
      }
    }

    const event = data as any
    const eventType = event.event
    const paymentEntity = event.payload?.payment?.entity

    // The Medusa payment session ID is stored in notes.medusa_session_id
    // when the Razorpay order is created in initiatePayment().
    // Using the Razorpay order ID (order_XXXXX) as session_id causes
    // "PaymentSession not found" errors because Medusa looks up sessions
    // by its own internal IDs, not Razorpay order IDs.
    const sessionId: string =
      paymentEntity?.notes?.medusa_session_id ||
      paymentEntity?.order_id ||
      ""

    this.logger_.info(
      `[Razorpay webhook] event=${eventType} session_id=${sessionId} razorpay_order_id=${paymentEntity?.order_id}`
    )

    switch (eventType) {
      case "payment.authorized":
        return {
          action: PaymentActions.AUTHORIZED,
          data: {
            session_id: sessionId,
            amount: new BigNumber(paymentEntity.amount / 100),
          },
        }
      case "payment.captured":
        return {
          action: PaymentActions.SUCCESSFUL,
          data: {
            session_id: sessionId,
            amount: new BigNumber(paymentEntity.amount / 100),
          },
        }
      case "payment.failed":
        return {
          action: PaymentActions.FAILED,
          data: {
            session_id: sessionId,
            amount: new BigNumber(paymentEntity.amount / 100),
          },
        }
      default:
        return {
          action: PaymentActions.NOT_SUPPORTED,
          data: {
            session_id: sessionId,
            amount: new BigNumber(0),
          },
        }
    }
  }
}

export default RazorpayProviderService
