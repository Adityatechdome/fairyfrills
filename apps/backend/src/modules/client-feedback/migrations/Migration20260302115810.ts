import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260302115810 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "client_feedback" ("id" text not null, "image_url" text not null, "customer_name" text not null, "platform" text check ("platform" in ('whatsapp', 'instagram')) not null, "caption" text null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "client_feedback_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_client_feedback_deleted_at" ON "client_feedback" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "client_feedback" cascade;`);
  }

}
