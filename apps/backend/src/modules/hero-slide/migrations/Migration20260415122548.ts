import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415122548 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" add column if not exists "mobile_background_image_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "hero_slide" drop column if exists "mobile_background_image_url";`);
  }

}
