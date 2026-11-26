import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "kitchen_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"kitchen_inbox" varchar,
  	"email_each_order" boolean DEFAULT true,
  	"kitchen_note" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ADD COLUMN "confirmation_sent_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "kitchen_settings" CASCADE;
  ALTER TABLE "orders" DROP COLUMN "confirmation_sent_at";`)
}
