import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_meals_allergens" AS ENUM('celery', 'gluten', 'crustaceans', 'eggs', 'fish', 'lupin', 'milk', 'molluscs', 'mustard', 'tree-nuts', 'peanuts', 'sesame', 'soya', 'sulphites');
  CREATE TYPE "public"."enum_meals_category" AS ENUM('rice', 'soups-stews');
  CREATE TYPE "public"."enum_meals_spice" AS ENUM('none', 'mild', 'medium', 'hot');
  CREATE TYPE "public"."enum_meals_status" AS ENUM('hidden', 'available', 'sold-out');
  CREATE TYPE "public"."enum_add_ons_allergens" AS ENUM('celery', 'gluten', 'crustaceans', 'eggs', 'fish', 'lupin', 'milk', 'molluscs', 'mustard', 'tree-nuts', 'peanuts', 'sesame', 'soya', 'sulphites');
  CREATE TYPE "public"."enum_add_ons_status" AS ENUM('hidden', 'available', 'sold-out');
  CREATE TYPE "public"."enum_users_role" AS ENUM('master-admin', 'kitchen', 'driver');
  CREATE TABLE "meals_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL
  );
  
  CREATE TABLE "meals_allergens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_meals_allergens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "meals" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category" "enum_meals_category" NOT NULL,
  	"description" varchar,
  	"price" numeric,
  	"ingredients" varchar,
  	"may_contain" varchar,
  	"allergen_check_checked_by_id" integer,
  	"allergen_check_checked_at" timestamp(3) with time zone,
  	"portion_grams" numeric DEFAULT 500,
  	"spice" "enum_meals_spice",
  	"halal" boolean,
  	"storage" varchar,
  	"reheating" varchar,
  	"shelf_life_days" numeric DEFAULT 2 NOT NULL,
  	"status" "enum_meals_status" DEFAULT 'hidden' NOT NULL,
  	"daily_limit" numeric,
  	"slug" varchar,
  	"sort_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "meals_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"add_ons_id" integer
  );
  
  CREATE TABLE "add_ons_allergens" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_add_ons_allergens",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "add_ons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"price" numeric NOT NULL,
  	"ingredients" varchar,
  	"may_contain" varchar,
  	"allergen_check_checked_by_id" integer,
  	"allergen_check_checked_at" timestamp(3) with time zone,
  	"status" "enum_add_ons_status" DEFAULT 'hidden' NOT NULL,
  	"sort_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activity_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"action" varchar NOT NULL,
  	"details" varchar,
  	"staff_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pack_settings_packs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" numeric NOT NULL,
  	"discount_percent" numeric NOT NULL
  );
  
  CREATE TABLE "pack_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'kitchen' NOT NULL;
  ALTER TABLE "users" ADD COLUMN "active" boolean DEFAULT true;
  -- Everyone who could sign in before roles existed had full access: keep it.
  UPDATE "users" SET "role" = 'master-admin';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "meals_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "add_ons_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "activity_log_id" integer;
  ALTER TABLE "meals_options" ADD CONSTRAINT "meals_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meals_allergens" ADD CONSTRAINT "meals_allergens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meals" ADD CONSTRAINT "meals_allergen_check_checked_by_id_users_id_fk" FOREIGN KEY ("allergen_check_checked_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meals_rels" ADD CONSTRAINT "meals_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meals_rels" ADD CONSTRAINT "meals_rels_add_ons_fk" FOREIGN KEY ("add_ons_id") REFERENCES "public"."add_ons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "add_ons_allergens" ADD CONSTRAINT "add_ons_allergens_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."add_ons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "add_ons" ADD CONSTRAINT "add_ons_allergen_check_checked_by_id_users_id_fk" FOREIGN KEY ("allergen_check_checked_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_staff_id_users_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pack_settings_packs" ADD CONSTRAINT "pack_settings_packs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pack_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "meals_options_order_idx" ON "meals_options" USING btree ("_order");
  CREATE INDEX "meals_options_parent_id_idx" ON "meals_options" USING btree ("_parent_id");
  CREATE INDEX "meals_allergens_order_idx" ON "meals_allergens" USING btree ("order");
  CREATE INDEX "meals_allergens_parent_idx" ON "meals_allergens" USING btree ("parent_id");
  CREATE INDEX "meals_allergen_check_allergen_check_checked_by_idx" ON "meals" USING btree ("allergen_check_checked_by_id");
  CREATE UNIQUE INDEX "meals_slug_idx" ON "meals" USING btree ("slug");
  CREATE INDEX "meals_updated_at_idx" ON "meals" USING btree ("updated_at");
  CREATE INDEX "meals_created_at_idx" ON "meals" USING btree ("created_at");
  CREATE INDEX "meals_rels_order_idx" ON "meals_rels" USING btree ("order");
  CREATE INDEX "meals_rels_parent_idx" ON "meals_rels" USING btree ("parent_id");
  CREATE INDEX "meals_rels_path_idx" ON "meals_rels" USING btree ("path");
  CREATE INDEX "meals_rels_add_ons_id_idx" ON "meals_rels" USING btree ("add_ons_id");
  CREATE INDEX "add_ons_allergens_order_idx" ON "add_ons_allergens" USING btree ("order");
  CREATE INDEX "add_ons_allergens_parent_idx" ON "add_ons_allergens" USING btree ("parent_id");
  CREATE INDEX "add_ons_allergen_check_allergen_check_checked_by_idx" ON "add_ons" USING btree ("allergen_check_checked_by_id");
  CREATE INDEX "add_ons_updated_at_idx" ON "add_ons" USING btree ("updated_at");
  CREATE INDEX "add_ons_created_at_idx" ON "add_ons" USING btree ("created_at");
  CREATE INDEX "activity_log_staff_idx" ON "activity_log" USING btree ("staff_id");
  CREATE INDEX "activity_log_updated_at_idx" ON "activity_log" USING btree ("updated_at");
  CREATE INDEX "activity_log_created_at_idx" ON "activity_log" USING btree ("created_at");
  CREATE INDEX "pack_settings_packs_order_idx" ON "pack_settings_packs" USING btree ("_order");
  CREATE INDEX "pack_settings_packs_parent_id_idx" ON "pack_settings_packs" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meals_fk" FOREIGN KEY ("meals_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_add_ons_fk" FOREIGN KEY ("add_ons_id") REFERENCES "public"."add_ons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_log_fk" FOREIGN KEY ("activity_log_id") REFERENCES "public"."activity_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_meals_id_idx" ON "payload_locked_documents_rels" USING btree ("meals_id");
  CREATE INDEX "payload_locked_documents_rels_add_ons_id_idx" ON "payload_locked_documents_rels" USING btree ("add_ons_id");
  CREATE INDEX "payload_locked_documents_rels_activity_log_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "meals_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meals_allergens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meals" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "meals_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "add_ons_allergens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "add_ons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "activity_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pack_settings_packs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pack_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "meals_options" CASCADE;
  DROP TABLE "meals_allergens" CASCADE;
  DROP TABLE "meals" CASCADE;
  DROP TABLE "meals_rels" CASCADE;
  DROP TABLE "add_ons_allergens" CASCADE;
  DROP TABLE "add_ons" CASCADE;
  DROP TABLE "activity_log" CASCADE;
  DROP TABLE "pack_settings_packs" CASCADE;
  DROP TABLE "pack_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_meals_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_add_ons_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_activity_log_fk";
  
  DROP INDEX "payload_locked_documents_rels_meals_id_idx";
  DROP INDEX "payload_locked_documents_rels_add_ons_id_idx";
  DROP INDEX "payload_locked_documents_rels_activity_log_id_idx";
  ALTER TABLE "users" DROP COLUMN "role";
  ALTER TABLE "users" DROP COLUMN "active";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "meals_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "add_ons_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "activity_log_id";
  DROP TYPE "public"."enum_meals_allergens";
  DROP TYPE "public"."enum_meals_category";
  DROP TYPE "public"."enum_meals_spice";
  DROP TYPE "public"."enum_meals_status";
  DROP TYPE "public"."enum_add_ons_allergens";
  DROP TYPE "public"."enum_add_ons_status";
  DROP TYPE "public"."enum_users_role";`)
}
