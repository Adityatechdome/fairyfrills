import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260305074532 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "promo_popup" ("id" text not null, "is_active" boolean not null default false, "banner_image_url" text null, "top_label" text null, "main_heading" text null, "sub_text" text null, "button_text" text null, "button_link" text null, "footer_note" text null, "show_dont_show_again" boolean not null default true, "delay_seconds" integer not null default 1, "cooldown_hours" integer not null default 48, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "promo_popup_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_promo_popup_deleted_at" ON "promo_popup" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "promo_popup" cascade;`);
  }

}
