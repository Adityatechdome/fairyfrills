import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260311095504 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" add column if not exists "ghl_welcome_webhook_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" drop column if exists "ghl_welcome_webhook_url";`);
  }

}
