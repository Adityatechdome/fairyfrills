import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl: import.meta.env.VITE_BACKEND_URL || window.location.origin,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
  fetchConfig: {
    credentials: "include",
  },
});
