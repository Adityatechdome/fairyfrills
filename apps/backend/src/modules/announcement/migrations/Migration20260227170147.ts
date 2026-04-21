import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260227170147 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "announcement" ("id" text not null, "message" text not null, "is_active" boolean not null default true, "order" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "announcement_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_announcement_deleted_at" ON "announcement" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "announcement" cascade;`);
  }

}
