ALTER TABLE "authors" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_uuid_unique" UNIQUE("uuid");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_uuid_unique" UNIQUE("uuid");