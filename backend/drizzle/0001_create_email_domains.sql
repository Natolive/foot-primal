CREATE TABLE "email_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
-- Domaine par défaut : les adresses pro de l'entreprise.
INSERT INTO "email_domains" ("domain") VALUES ('solem.fr');
