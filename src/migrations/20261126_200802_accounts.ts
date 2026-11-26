import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_login_tokens_purpose" AS ENUM('login', 'save-details', 'change-email', 'delete');
  CREATE TABLE "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"name" varchar,
  	"phone" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"city" varchar,
  	"postcode" varchar,
  	"delivery_notes" varchar,
  	"marketing_consent" boolean,
  	"marketing_consent_at" timestamp(3) with time zone,
  	"marketing_consent_note" varchar,
  	"last_active_at" timestamp(3) with time zone,
  	"inactivity_warned_at" timestamp(3) with time zone,
  	"stripe_customer_id" varchar,
  	"previous_emails" jsonb,
  	"session_version" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "login_tokens" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"token_hash" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"purpose" "enum_login_tokens_purpose" NOT NULL,
  	"order_id" numeric,
  	"customer_id" numeric,
  	"new_email" varchar,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "orders" ADD COLUMN "update_saved_details" boolean;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "login_tokens_id" integer;
  CREATE UNIQUE INDEX "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX "customers_postcode_idx" ON "customers" USING btree ("postcode");
  CREATE INDEX "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX "login_tokens_token_hash_idx" ON "login_tokens" USING btree ("token_hash");
  CREATE INDEX "login_tokens_email_idx" ON "login_tokens" USING btree ("email");
  CREATE INDEX "login_tokens_updated_at_idx" ON "login_tokens" USING btree ("updated_at");
  CREATE INDEX "login_tokens_created_at_idx" ON "login_tokens" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_login_tokens_fk" FOREIGN KEY ("login_tokens_id") REFERENCES "public"."login_tokens"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX "payload_locked_documents_rels_login_tokens_id_idx" ON "payload_locked_documents_rels" USING btree ("login_tokens_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "login_tokens" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "login_tokens" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_login_tokens_fk";
  
  DROP INDEX "payload_locked_documents_rels_customers_id_idx";
  DROP INDEX "payload_locked_documents_rels_login_tokens_id_idx";
  ALTER TABLE "orders" DROP COLUMN "update_saved_details";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "customers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "login_tokens_id";
  DROP TYPE "public"."enum_login_tokens_purpose";`)
}
