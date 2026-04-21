import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260323085354 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "customer_phone" drop constraint if exists "customer_phone_customer_id_unique";`);
    this.addSql(`create table if not exists "customer_phone" ("id" text not null, "customer_id" text not null, "phone_number" text null, "phone_verified" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "customer_phone_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_customer_phone_customer_id_unique" ON "customer_phone" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_customer_phone_deleted_at" ON "customer_phone" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "customer_phone" cascade;`);
  }

}
