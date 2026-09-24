ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verification_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_verification_token_hash_unique" UNIQUE("email_verification_token_hash");--> statement-breakpoint
-- Comptes créés avant la confirmation par email : considérés comme confirmés.
UPDATE "users" SET "email_verified_at" = "created_at";
