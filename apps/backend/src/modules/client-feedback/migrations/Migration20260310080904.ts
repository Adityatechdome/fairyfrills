import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260310080904 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "client_feedback" add column if not exists "city" text null, add column if not exists "rating" integer not null default 5;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "client_feedback" drop column if exists "city", drop column if exists "rating";`);
  }

}
