import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "two_step_enabled_at" timestamp(3) with time zone;
  ALTER TABLE "users" ADD COLUMN "totp_secret" varchar;
  ALTER TABLE "users" ADD COLUMN "totp_pending_secret" varchar;
  ALTER TABLE "users" ADD COLUMN "totp_last_step" numeric;
  ALTER TABLE "users" ADD COLUMN "totp_backup_codes" jsonb;
  ALTER TABLE "users" ADD COLUMN "totp_failures" numeric;
  ALTER TABLE "users" ADD COLUMN "totp_locked_until" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "two_step_enabled_at";
  ALTER TABLE "users" DROP COLUMN "totp_secret";
  ALTER TABLE "users" DROP COLUMN "totp_pending_secret";
  ALTER TABLE "users" DROP COLUMN "totp_last_step";
  ALTER TABLE "users" DROP COLUMN "totp_backup_codes";
  ALTER TABLE "users" DROP COLUMN "totp_failures";
  ALTER TABLE "users" DROP COLUMN "totp_locked_until";`)
}
