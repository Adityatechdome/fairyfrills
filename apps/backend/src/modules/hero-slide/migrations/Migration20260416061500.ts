import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260416061500 extends Migration {

  override async up(): Promise<void> {
    // Add new text_position and mobile_text_position columns
    this.addSql(`alter table if exists "hero_slide" add column if not exists "text_position" text check ("text_position" in ('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')) default 'middle-left' not null;`);
    this.addSql(`alter table if exists "hero_slide" add column if not exists "mobile_text_position" text check ("mobile_text_position" in ('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right')) null;`);
    
    // Migrate existing data: combine text_horizontal_align and text_vertical_position into text_position
    this.addSql(`update "hero_slide" set "text_position" = "text_vertical_position" || '-' || "text_horizontal_align" where "text_horizontal_align" is not null and "text_vertical_position" is not null;`);
    
    // Migrate existing mobile data if present
    this.addSql(`update "hero_slide" set "mobile_text_position" = "mobile_text_vertical_position" || '-' || "mobile_text_horizontal_align" where "mobile_text_horizontal_align" is not null and "mobile_text_vertical_position" is not null;`);
    
    // Drop old columns
    this.addSql(`alter table if exists "hero_slide" drop column if exists "text_horizontal_align", drop column if exists "text_vertical_position", drop column if exists "mobile_text_horizontal_align", drop column if exists "mobile_text_vertical_position";`);
  }

  override async down(): Promise<void> {
    // Re-add old columns
    this.addSql(`alter table if exists "hero_slide" add column if not exists "text_horizontal_align" text check ("text_horizontal_align" in ('left', 'center', 'right')) default 'left' not null;`);
    this.addSql(`alter table if exists "hero_slide" add column if not exists "text_vertical_position" text check ("text_vertical_position" in ('top', 'middle', 'bottom')) default 'middle' not null;`);
    this.addSql(`alter table if exists "hero_slide" add column if not exists "mobile_text_horizontal_align" text check ("mobile_text_horizontal_align" in ('left', 'center', 'right')) null;`);
    this.addSql(`alter table if exists "hero_slide" add column if not exists "mobile_text_vertical_position" text check ("mobile_text_vertical_position" in ('top', 'middle', 'bottom')) null;`);
    
    // Migrate back from text_position to separate columns
    this.addSql(`update "hero_slide" set "text_horizontal_align" = split_part("text_position", '-', 2), "text_vertical_position" = split_part("text_position", '-', 1) where "text_position" is not null;`);
    
    // Migrate back mobile data if present
    this.addSql(`update "hero_slide" set "mobile_text_horizontal_align" = split_part("mobile_text_position", '-', 2), "mobile_text_vertical_position" = split_part("mobile_text_position", '-', 1) where "mobile_text_position" is not null;`);
    
    // Drop new columns
    this.addSql(`alter table if exists "hero_slide" drop column if exists "text_position", drop column if exists "mobile_text_position";`);
  }

}
