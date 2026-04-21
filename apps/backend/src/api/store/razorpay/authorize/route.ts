import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const {
    cart_id,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  } = req.body as {
    cart_id: string
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }

  if (!cart_id || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      message: "Missing required fields",
    })
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) {
    return res.status(500).json({ message: "Razorpay not configured" })
  }

  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex")

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment signature" })
  }

  return res.json({
    success: true,
    verified: true,
  })
}
