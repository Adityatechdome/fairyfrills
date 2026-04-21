import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260310071030 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hero_banner" add column if not exists "heading" text null, add column if not exists "highlight_text" text null, add column if not exists "subheading" text null, add column if not exists "badge_text" text null, add column if not exists "shop_now_label" text null, add column if not exists "shop_now_link" text null, add column if not exists "virtual_tryon_label" text null, add column if not exists "virtual_tryon_link" text null, add column if not exists "stat_1_value" text null, add column if not exists "stat_1_label" text null, add column if not exists "stat_2_value" text null, add column if not exists "stat_2_label" text null, add column if not exists "stat_3_value" text null, add column if not exists "stat_3_label" text null, add column if not exists "collage_image_1" text null, add column if not exists "collage_image_2" text null, add column if not exists "collage_image_3" text null;`);
    this.addSql(`alter table if exists "hero_banner" alter column "image_url" type text using ("image_url"::text);`);
    this.addSql(`alter table if exists "hero_banner" alter column "image_url" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "hero_banner" drop column if exists "heading", drop column if exists "highlight_text", drop column if exists "subheading", drop column if exists "badge_text", drop column if exists "shop_now_label", drop column if exists "shop_now_link", drop column if exists "virtual_tryon_label", drop column if exists "virtual_tryon_link", drop column if exists "stat_1_value", drop column if exists "stat_1_label", drop column if exists "stat_2_value", drop column if exists "stat_2_label", drop column if exists "stat_3_value", drop column if exists "stat_3_label", drop column if exists "collage_image_1", drop column if exists "collage_image_2", drop column if exists "collage_image_3";`);

    this.addSql(`alter table if exists "hero_banner" alter column "image_url" type text using ("image_url"::text);`);
    this.addSql(`alter table if exists "hero_banner" alter column "image_url" set not null;`);
  }

}
