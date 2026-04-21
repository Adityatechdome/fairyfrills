import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260417071550 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" add column if not exists "auth_banner_image_url" text null, add column if not exists "top_sellers_subheading" text not null default 'OUR BESTSELLERS', add column if not exists "top_sellers_heading" text not null default 'Top Sellers';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "site_settings" drop column if exists "auth_banner_image_url", drop column if exists "top_sellers_subheading", drop column if exists "top_sellers_heading";`);
  }

}
