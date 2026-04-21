import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260302090221 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "footer_link" ("id" text not null, "label" text not null, "url" text not null, "column" text check ("column" in ('company_info', 'company_policies')) not null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "footer_link_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_footer_link_deleted_at" ON "footer_link" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "footer_link" cascade;`);
  }

}
