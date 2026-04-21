import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260302113932 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "site_settings" ("id" text not null, "confetti_enabled" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "site_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_site_settings_deleted_at" ON "site_settings" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "site_settings" cascade;`);
  }

}
