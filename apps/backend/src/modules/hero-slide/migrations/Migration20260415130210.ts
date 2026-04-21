import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415130210 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" add column if not exists "mobile_text_horizontal_align" text check ("mobile_text_horizontal_align" in ('left', 'center', 'right')) null, add column if not exists "mobile_text_vertical_position" text check ("mobile_text_vertical_position" in ('top', 'middle', 'bottom')) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" drop column if exists "mobile_text_horizontal_align", drop column if exists "mobile_text_vertical_position";`);
  }

}
