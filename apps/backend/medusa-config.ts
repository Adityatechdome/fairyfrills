import { defineConfig, loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

function resolveBackendUrl(): string {
  if (process.env.MEDUSA_BACKEND_URL) return process.env.MEDUSA_BACKEND_URL;
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS) {
    return `https://${process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS}`;
  }
  return "http://localhost:9000";
}

module.exports = defineConfig({
  admin: {
    vite: () => {
      // Admin configuration
      let hmrServer;
      if (process.env.HMR_BIND_HOST) {
        const { createServer } = require("http");
        hmrServer = createServer();
        const hmrPort = parseInt(process.env.HMR_PORT || "9001");
        hmrServer.listen(hmrPort, process.env.HMR_BIND_HOST);
      }

      let allowedHosts;
      if (process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS) {
        allowedHosts = [process.env.__MEDUSA_ADDITIONAL_ALLOWED_HOSTS];
      }

      return {
        envPrefix: "VITE_",
        define: {
          // Allow up to 20 MB per file in the Admin media uploader
          __MAX_UPLOAD_FILE_SIZE__: 20 * 1024 * 1024,
        },
        server: {
          allowedHosts,
          hmr: {
            server: hmrServer,
          },
        },
      };
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    databaseDriverOptions: {
      pool: {
        min: 2,
        max: 20,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
      },
      connection: {
        ssl: process.env.NODE_ENV === "production" 
          ? { rejectUnauthorized: false }
          : false,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    { resolve: "./src/modules/hero-banner" },
    { resolve: "./src/modules/hero-slide" },
    { resolve: "./src/modules/announcement" },
    { resolve: "./src/modules/marquee" },
    { resolve: "./src/modules/footer-content" },
    { resolve: "./src/modules/footer-links" },
    { resolve: "./src/modules/testimonial" },
    { resolve: "./src/modules/content-page" },
    { resolve: "./src/modules/faq" },
    { resolve: "./src/modules/blog-post" },
    { resolve: "./src/modules/contact-submission" },
    { resolve: "./src/modules/top-seller" },
    { resolve: "./src/modules/site-settings" },
    { resolve: "./src/modules/client-diary" },
    { resolve: "./src/modules/client-feedback" },
    { resolve: "./src/modules/promo-popup" },
    { resolve: "./src/modules/customer-phone" },
    { resolve: "./src/modules/otp-verification" },
    { resolve: "./src/modules/vto" },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID || "",
              key_secret: process.env.RAZORPAY_KEY_SECRET || "",
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
              auto_capture: true,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          ...(process.env.R2_FILE_URL ? [{
            id: "r2-custom",
            resolve: "./src/modules/r2-file",
            is_default: true,
            options: {
              file_url: process.env.R2_FILE_URL,
              prefix: process.env.R2_PREFIX,
              bucket: process.env.R2_BUCKET,
              endpoint: process.env.R2_ENDPOINT,
              access_key_id: process.env.R2_ACCESS_KEY_ID,
              secret_access_key: process.env.R2_SECRET_ACCESS_KEY,
              region: "auto",
            },
          }] : process.env.S3_FILE_URL && process.env.S3_ACCESS_KEY_ID ? [{
            id: "s3",
            resolve: "@medusajs/medusa/file-s3",
            is_default: true,
            options: {
              file_url: process.env.S3_FILE_URL,
              prefix: process.env.S3_PREFIX,
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              region: process.env.S3_REGION,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
            },
          }] : [{
            id: "local",
            resolve: "@medusajs/medusa/file-local",
            is_default: true,
            options: {
              upload_dir: "uploads",
              backend_url: resolveBackendUrl(),
            },
          }]),
        ],
      },
    },
  ],
});
