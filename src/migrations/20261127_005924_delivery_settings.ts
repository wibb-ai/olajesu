import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_fulfilment" AS ENUM('delivery', 'collection');
  CREATE TYPE "public"."enum_delivery_settings_delivery_days_day" AS ENUM('1', '2', '3', '4', '5', '6', '0');
  CREATE TYPE "public"."enum_delivery_settings_delivery_days_cutoff_hour" AS ENUM('6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20');
  CREATE TABLE "delivery_settings_delivery_days" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_delivery_settings_delivery_days_day" NOT NULL,
  	"cutoff_days_before" numeric DEFAULT 2 NOT NULL,
  	"cutoff_hour" "enum_delivery_settings_delivery_days_cutoff_hour" DEFAULT '20' NOT NULL
  );
  
  CREATE TABLE "delivery_settings_closed_dates" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "delivery_settings_areas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"fee" numeric NOT NULL,
  	"free_over" numeric,
  	"postcodes" varchar NOT NULL
  );
  
  CREATE TABLE "delivery_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"draft" boolean DEFAULT true,
  	"daily_meal_limit" numeric,
  	"delivery_window" varchar,
  	"failed_delivery" varchar DEFAULT 'If no one is in, we’ll call you. If we can’t reach you, we’ll leave your Meals somewhere safe only if your delivery notes say where; otherwise we take them back and you can collect them the same day.',
  	"collection_enabled" boolean DEFAULT true,
  	"collection_address" varchar DEFAULT 'unit 3 20-22 Mary Street, Manchester, M3 1DZ',
  	"collection_times" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "orders" ADD COLUMN "fulfilment" "enum_orders_fulfilment" DEFAULT 'delivery' NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "cutoff_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "address_check" varchar;
  ALTER TABLE "orders" ADD COLUMN "delivery_fee" numeric DEFAULT 0;
  ALTER TABLE "delivery_settings_delivery_days" ADD CONSTRAINT "delivery_settings_delivery_days_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_settings_closed_dates" ADD CONSTRAINT "delivery_settings_closed_dates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "delivery_settings_areas" ADD CONSTRAINT "delivery_settings_areas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."delivery_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "delivery_settings_delivery_days_order_idx" ON "delivery_settings_delivery_days" USING btree ("_order");
  CREATE INDEX "delivery_settings_delivery_days_parent_id_idx" ON "delivery_settings_delivery_days" USING btree ("_parent_id");
  CREATE INDEX "delivery_settings_closed_dates_order_idx" ON "delivery_settings_closed_dates" USING btree ("_order");
  CREATE INDEX "delivery_settings_closed_dates_parent_id_idx" ON "delivery_settings_closed_dates" USING btree ("_parent_id");
  CREATE INDEX "delivery_settings_areas_order_idx" ON "delivery_settings_areas" USING btree ("_order");
  CREATE INDEX "delivery_settings_areas_parent_id_idx" ON "delivery_settings_areas" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "delivery_settings_delivery_days" CASCADE;
  DROP TABLE "delivery_settings_closed_dates" CASCADE;
  DROP TABLE "delivery_settings_areas" CASCADE;
  DROP TABLE "delivery_settings" CASCADE;
  ALTER TABLE "orders" DROP COLUMN "fulfilment";
  ALTER TABLE "orders" DROP COLUMN "cutoff_at";
  ALTER TABLE "orders" DROP COLUMN "address_check";
  ALTER TABLE "orders" DROP COLUMN "delivery_fee";
  DROP TYPE "public"."enum_orders_fulfilment";
  DROP TYPE "public"."enum_delivery_settings_delivery_days_day";
  DROP TYPE "public"."enum_delivery_settings_delivery_days_cutoff_hour";`)
}
