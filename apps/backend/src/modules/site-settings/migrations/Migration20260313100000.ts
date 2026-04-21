import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260313100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" add column if not exists "auth_banner_image_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" drop column if exists "auth_banner_image_url";`);
  }

}
