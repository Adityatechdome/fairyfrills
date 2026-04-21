import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260310083713 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" add column if not exists "virtual_tryon_html" text null, add column if not exists "virtual_tryon_bg_image_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" drop column if exists "virtual_tryon_html", drop column if exists "virtual_tryon_bg_image_url";`);
  }

}
