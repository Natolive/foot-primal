ALTER TABLE "users" ADD COLUMN "password_reset_token_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_reset_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_password_reset_token_hash_unique" UNIQUE("password_reset_token_hash");