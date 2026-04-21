import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import multer from "multer"

const upload = multer({ storage: multer.memoryStorage() })

export default defineMiddlewares({
  routes: [
    // Bulk operations — large JSON payload
    {
      matcher: "/admin/bulk-operations/update-prices",
      method: ["POST"],
      bodyParser: { sizeLimit: "500kb" },
    },
    // VTO routes — require customer auth
    {
      matcher: "/store/vto/upload-photo",
      method: ["POST"],
      middlewares: [
        authenticate("customer", ["bearer", "session"]),
        // @ts-ignore
        upload.array("files"),
      ],
    },
    {
      matcher: "/store/vto/submit",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/vto/status",
      method: ["GET"],
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/vto/history",
      method: ["GET", "DELETE"],
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/vto/save",
      method: ["POST"],
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    // Auth status — allow unauthenticated (returns is_logged_in: false if no token)
    {
      matcher: "/store/auth/status",
      method: ["GET"],
      middlewares: [authenticate("customer", ["bearer", "session"], { allowUnauthenticated: true })],
    },
    // Email OTP — unauthenticated (login/signup flow)
    {
      matcher: "/store/otp/email/send",
      method: ["POST"],
      middlewares: [],
    },
    {
      matcher: "/store/otp/email/verify",
      method: ["POST"],
      middlewares: [],
    },
    // Phone OTP — unauthenticated (login/signup flow)
    {
      matcher: "/store/otp/phone/send",
      method: ["POST"],
      middlewares: [],
    },
    {
      matcher: "/store/otp/phone/verify",
      method: ["POST"],
      middlewares: [],
    },
  ],
})
