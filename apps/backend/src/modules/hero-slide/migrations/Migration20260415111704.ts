import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415111704 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "hero_slide" ("id" text not null, "background_image_url" text not null, "badge_text" text null, "heading" text null, "highlight_text" text null, "subheading" text null, "primary_button_label" text null, "primary_button_link" text null, "secondary_button_label" text null, "secondary_button_link" text null, "stat_1_value" text null, "stat_1_label" text null, "stat_2_value" text null, "stat_2_label" text null, "stat_3_value" text null, "stat_3_label" text null, "text_horizontal_align" text check ("text_horizontal_align" in ('left', 'center', 'right')) not null default 'left', "text_vertical_position" text check ("text_vertical_position" in ('top', 'middle', 'bottom')) not null default 'middle', "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hero_slide_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_hero_slide_deleted_at" ON "hero_slide" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "hero_slide" cascade;`);
  }

}
