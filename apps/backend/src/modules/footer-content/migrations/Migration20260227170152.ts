import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260227170152 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "footer_content" ("id" text not null, "brand_description" text null, "instagram_url" text null, "youtube_url" text null, "facebook_url" text null, "email" text null, "phone" text null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "footer_content_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_footer_content_deleted_at" ON "footer_content" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "footer_content" cascade;`);
  }

}
