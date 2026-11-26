import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_status" AS ENUM('awaiting-payment', 'paid', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'cancelled', 'partly-refunded', 'refunded', 'expired');
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"number" varchar NOT NULL,
  	"status" "enum_orders_status" DEFAULT 'awaiting-payment' NOT NULL,
  	"delivery_date" timestamp(3) with time zone NOT NULL,
  	"summary" varchar,
  	"subtotal" numeric NOT NULL,
  	"savings" numeric,
  	"total" numeric NOT NULL,
  	"items" jsonb,
  	"customer_name" varchar,
  	"email" varchar,
  	"phone" varchar,
  	"delivery_address" varchar,
  	"marketing_consent" boolean,
  	"stripe_session_id" varchar,
  	"stripe_payment_intent_id" varchar,
  	"paid_at" timestamp(3) with time zone,
  	"access_token" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  CREATE UNIQUE INDEX "orders_number_idx" ON "orders" USING btree ("number");
  CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");
  CREATE INDEX "orders_delivery_date_idx" ON "orders" USING btree ("delivery_date");
  CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");
  CREATE INDEX "orders_stripe_session_id_idx" ON "orders" USING btree ("stripe_session_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "orders" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  DROP TYPE "public"."enum_orders_status";`)
}
