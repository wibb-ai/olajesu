import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_cancelled_by" AS ENUM('customer', 'kitchen');
  CREATE TABLE "orders_refunds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"amount" numeric,
  	"at" timestamp(3) with time zone,
  	"reason" varchar,
  	"details" varchar,
  	"by_id" integer,
  	"stripe_refund_id" varchar
  );
  
  ALTER TABLE "orders" ADD COLUMN "refunded_total" numeric DEFAULT 0;
  ALTER TABLE "orders" ADD COLUMN "cancelled_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "cancelled_by" "enum_orders_cancelled_by";
  ALTER TABLE "orders" ADD COLUMN "refunded_units" jsonb;
  ALTER TABLE "orders_refunds" ADD CONSTRAINT "orders_refunds_by_id_users_id_fk" FOREIGN KEY ("by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_refunds" ADD CONSTRAINT "orders_refunds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "orders_refunds_order_idx" ON "orders_refunds" USING btree ("_order");
  CREATE INDEX "orders_refunds_parent_id_idx" ON "orders_refunds" USING btree ("_parent_id");
  CREATE INDEX "orders_refunds_by_idx" ON "orders_refunds" USING btree ("by_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "orders_refunds" CASCADE;
  ALTER TABLE "orders" DROP COLUMN "refunded_total";
  ALTER TABLE "orders" DROP COLUMN "cancelled_at";
  ALTER TABLE "orders" DROP COLUMN "cancelled_by";
  ALTER TABLE "orders" DROP COLUMN "refunded_units";
  DROP TYPE "public"."enum_orders_cancelled_by";`)
}
