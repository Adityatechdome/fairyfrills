import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260302110550 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "contact_submission" ("id" text not null, "first_name" text not null, "last_name" text not null, "email" text not null, "phone" text not null default '', "country" text not null default '', "message" text not null, "status" text check ("status" in ('new', 'read', 'replied')) not null default 'new', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "contact_submission_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_contact_submission_deleted_at" ON "contact_submission" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "contact_submission" cascade;`);
  }

}
