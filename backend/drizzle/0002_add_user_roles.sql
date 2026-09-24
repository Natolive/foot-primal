CREATE TYPE "public"."role" AS ENUM('user', 'super_admin');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;