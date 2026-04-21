import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260416100000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      'ALTER TABLE "hero_slide" ADD COLUMN "heading_color" text NULL, ADD COLUMN "highlight_color" text NULL, ADD COLUMN "subheading_color" text NULL;'
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      'ALTER TABLE "hero_slide" DROP COLUMN "heading_color", DROP COLUMN "highlight_color", DROP COLUMN "subheading_color";'
    )
  }
}
