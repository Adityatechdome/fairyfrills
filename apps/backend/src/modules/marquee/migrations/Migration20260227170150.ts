import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260227170150 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "marquee" ("id" text not null, "text_items" jsonb not null default '[]', "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "marquee_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_marquee_deleted_at" ON "marquee" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "marquee" cascade;`);
  }

}
