import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function seedAdmin({ container }: ExecArgs) {
  const logger = container.resolve("logger")
  const authModuleService = container.resolve(Modules.AUTH)
  const userModuleService = container.resolve(Modules.USER)

  const adminEmail = "admin@fairyfrills.com"
  const adminPassword = "admin123"

  // Check if user already exists
  const existingUsers = await userModuleService.listUsers({ email: adminEmail })
  if (existingUsers.length > 0) {
    logger.info(`Admin user ${adminEmail} already exists, skipping creation.`)
    return
  }

  logger.info(`Creating admin user: ${adminEmail}`)

  // Use authModuleService.register() so the emailpass provider hashes the password correctly
  const { success, authIdentity, error } = await authModuleService.register(
    "emailpass",
    {
      url: "",
      headers: {},
      query: {},
      body: {
        email: adminEmail,
        password: adminPassword,
      },
      protocol: "https",
    }
  )

  if (!success || !authIdentity) {
    logger.error(`Failed to register auth identity: ${error}`)
    return
  }

  // Create the user record
  const user = await userModuleService.createUsers({
    email: adminEmail,
    first_name: "Fairy Frills",
    last_name: "Admin",
  })

  // Link auth identity to user
  await authModuleService.updateAuthIdentities({
    id: authIdentity.id,
    app_metadata: {
      user_id: user.id,
    },
  })

  logger.info(`Admin user ${adminEmail} created successfully.`)
}
