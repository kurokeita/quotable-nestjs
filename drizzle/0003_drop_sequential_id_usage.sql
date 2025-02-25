/** First, we need to drop all constraints and references to sequential IDs */
ALTER TABLE "authors" DROP CONSTRAINT "authors_uuid_unique";--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_uuid_unique";--> statement-breakpoint
ALTER TABLE "quote_tags" DROP CONSTRAINT "quote_tags_quoteId_fkey";--> statement-breakpoint
ALTER TABLE "quote_tags" DROP CONSTRAINT "quote_tags_tagId_fkey";--> statement-breakpoint
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_authorId_fkey";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_uuid_unique";--> statement-breakpoint
ALTER TABLE "tags" DROP CONSTRAINT "tags_pkey";--> statement-breakpoint

/** Add new temp columns to migrate the sequential IDs to UUIDs */
ALTER TABLE "quote_tags" ADD COLUMN "quoteUuid" uuid;--> statement-breakpoint
ALTER TABLE "quote_tags" ADD COLUMN "tagUuid" uuid;--> statement-breakpoint

UPDATE "quote_tags" qt
SET "quoteUuid" = q."uuid"
FROM "quotes" q
WHERE qt."quoteId" = q."id";--> statement-breakpoint

UPDATE "quote_tags" qt
SET "tagUuid" = t."uuid"
FROM "tags" t
WHERE qt."tagId" = t."id";--> statement-breakpoint

/** Drop the old sequential IDs and rename the new ones, then add constraints */
ALTER TABLE "quote_tags" DROP COLUMN "quoteId";--> statement-breakpoint
ALTER TABLE "quote_tags" DROP COLUMN "tagId";--> statement-breakpoint
ALTER TABLE "quote_tags" RENAME COLUMN "quoteUuid" TO "quoteId";--> statement-breakpoint
ALTER TABLE "quote_tags" RENAME COLUMN "tagUuid" TO "tagId";--> statement-breakpoint

/** Now we can finally drop the sequential IDs and rename the new ones */
ALTER TABLE "tags" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "tags" RENAME COLUMN "uuid" TO "id";--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "shortId" varchar(10);--> statement-breakpoint
UPDATE "tags" SET "shortId" = substr(md5(random()::text), 1, 10);--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "shortId" SET NOT NULL;

ALTER TABLE "quotes" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "quotes" RENAME COLUMN "uuid" TO "id";--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "authorUuid" uuid;--> statement-breakpoint
UPDATE "quotes" SET "authorUuid" = a."uuid" FROM "authors" a WHERE "quotes"."authorId" = a."id";--> statement-breakpoint
ALTER TABLE "quotes" DROP COLUMN "authorId";--> statement-breakpoint
ALTER TABLE "quotes" RENAME COLUMN "authorUuid" TO "authorId";--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "shortId" varchar(10);--> statement-breakpoint
UPDATE "quotes" SET "shortId" = substr(md5(random()::text), 1, 10);--> statement-breakpoint
ALTER TABLE "quotes" ALTER COLUMN "shortId" SET NOT NULL;

ALTER TABLE "authors" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "authors" RENAME COLUMN "uuid" TO "id";--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "shortId" varchar(10);--> statement-breakpoint
UPDATE "authors" SET "shortId" = substr(md5(random()::text), 1, 10);--> statement-breakpoint
ALTER TABLE "authors" ALTER COLUMN "shortId" SET NOT NULL;

ALTER TABLE "tags" ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_pkey" PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_shortId_unique" UNIQUE("shortId");--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_shortId_unique" UNIQUE("shortId");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_shortId_unique" UNIQUE("shortId");--> statement-breakpoint
ALTER TABLE "quote_tags" ADD CONSTRAINT "quote_tags_quote_id_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_tags" ADD CONSTRAINT "quote_tags_tag_id_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_tags" ADD CONSTRAINT "quote_tags_pkey" PRIMARY KEY("quoteId","tagId");--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
