import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260415000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`ALTER TABLE "footer_content" ADD COLUMN IF NOT EXISTS "twitter_url" text null;`);
    this.addSql(`ALTER TABLE "footer_content" ADD COLUMN IF NOT EXISTS "pinterest_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`ALTER TABLE "footer_content" DROP COLUMN IF EXISTS "twitter_url";`);
    this.addSql(`ALTER TABLE "footer_content" DROP COLUMN IF EXISTS "pinterest_url";`);
  }

}
