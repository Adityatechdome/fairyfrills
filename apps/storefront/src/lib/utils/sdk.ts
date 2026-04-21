import Medusa from "@medusajs/js-sdk"

const getEnv = (key: string, fallback: string = "") => {
  if (typeof import.meta.env !== "undefined" && import.meta.env[key]) {
    return import.meta.env[key]
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]
  }
  return fallback
}

const MEDUSA_BACKEND_URL = getEnv("VITE_MEDUSA_BACKEND_URL", "http://localhost:9000")

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: import.meta.env?.DEV ?? false,
  publishableKey: getEnv("VITE_MEDUSA_PUBLISHABLE_KEY"),
  auth: {
    type: "jwt",
  }
})
