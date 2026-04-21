import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260312070532 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" add column if not exists "ghl_order_webhook_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" drop column if exists "ghl_order_webhook_url";`);
  }

}
