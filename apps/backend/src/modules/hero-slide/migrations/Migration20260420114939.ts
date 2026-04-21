import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260420114939 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" drop column if exists "text_horizontal_align", drop column if exists "text_vertical_position", drop column if exists "mobile_text_horizontal_align", drop column if exists "mobile_text_vertical_position";`);

    this.addSql(`alter table if exists "hero_slide" add column if not exists "text_position" text check ("text_position" in ('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')) not null default 'middle-left', add column if not exists "mobile_text_position" text check ("mobile_text_position" in ('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')) null, add column if not exists "heading_color" text null, add column if not exists "highlight_color" text null, add column if not exists "subheading_color" text null, add column if not exists "badge_text_color" text null, add column if not exists "primary_button_text_color" text null, add column if not exists "secondary_button_text_color" text null, add column if not exists "stats_text_color" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" drop column if exists "text_position", drop column if exists "mobile_text_position", drop column if exists "heading_color", drop column if exists "highlight_color", drop column if exists "subheading_color", drop column if exists "badge_text_color", drop column if exists "primary_button_text_color", drop column if exists "secondary_button_text_color", drop column if exists "stats_text_color";`);

    this.addSql(`alter table if exists "hero_slide" add column if not exists "text_horizontal_align" text check ("text_horizontal_align" in ('left', 'center', 'right')) not null default 'left', add column if not exists "text_vertical_position" text check ("text_vertical_position" in ('top', 'middle', 'bottom')) not null default 'middle', add column if not exists "mobile_text_horizontal_align" text check ("mobile_text_horizontal_align" in ('left', 'center', 'right')) null, add column if not exists "mobile_text_vertical_position" text check ("mobile_text_vertical_position" in ('top', 'middle', 'bottom')) null;`);
  }

}
