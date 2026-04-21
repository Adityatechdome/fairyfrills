import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260323085405 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "otp_record" ("id" text not null, "customer_id" text not null, "phone_number" text not null, "otp_code" text not null, "expires_at" timestamptz not null, "attempts" integer not null default 0, "verified" boolean not null default false, "locked_until" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "otp_record_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_otp_record_deleted_at" ON "otp_record" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "otp_record" cascade;`);
  }

}
