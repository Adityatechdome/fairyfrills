import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260401103151 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vto_session" ("id" text not null, "customer_id" text not null, "model_photo_url" text not null, "product_id" text null, "product_image_url" text not null, "kling_task_id" text null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed', 'timed_out', 'abandoned')) not null default 'pending', "result_image_url" text null, "error_message" text null, "completed_at" timestamptz null, "saved" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vto_session_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vto_session_deleted_at" ON "vto_session" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vto_uploaded_photo" ("id" text not null, "customer_id" text not null, "photo_url" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vto_uploaded_photo_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vto_uploaded_photo_deleted_at" ON "vto_uploaded_photo" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vto_session" cascade;`);

    this.addSql(`drop table if exists "vto_uploaded_photo" cascade;`);
  }

}
