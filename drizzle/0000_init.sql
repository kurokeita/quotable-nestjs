CREATE TABLE "authors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"bio" text,
	"link" varchar(255),
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"deletedAt" timestamp with time zone,
	CONSTRAINT "authors_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"authorId" bigint NOT NULL,
	"content" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quote_tags" (
	"quoteId" bigint NOT NULL,
	"tagId" bigint NOT NULL,
	CONSTRAINT "quote_tags_pkey" PRIMARY KEY("quoteId","tagId")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP(6) NOT NULL,
	"deletedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_tags" ADD CONSTRAINT "quote_tags_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_tags" ADD CONSTRAINT "quote_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_content_unique" ON "quotes" USING btree ("content" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "unique_tags_name" ON "tags" USING btree ("name" text_ops);