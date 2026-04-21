import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260417071550 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "top_seller" add column if not exists "badge_type" text check ("badge_type" in ('NEW', 'EXCLUSIVE', 'TRENDING', 'BESTSELLER', 'VIRAL', 'HOT', 'LIMITED_EDITION', 'SOLD_OUT')) null, add column if not exists "badge_visible" boolean not null default true, add column if not exists "compare_at_price" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "top_seller" drop column if exists "badge_type", drop column if exists "badge_visible", drop column if exists "compare_at_price";`);
  }

}
