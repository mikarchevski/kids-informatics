CREATE TABLE "article_tags" (
	"article_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "article_tags_article_id_tag_id_pk" PRIMARY KEY("article_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(7) DEFAULT '#999999' NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
INSERT INTO "tags" ("name", "color")
SELECT DISTINCT ON (btrim("tag")) btrim("tag"), COALESCE("tag_color", '#999999')
FROM "articles"
WHERE NULLIF(btrim("tag"), '') IS NOT NULL
ORDER BY btrim("tag"), "tag_color" NULLS LAST
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "article_tags" ("article_id", "tag_id")
SELECT "articles"."id", "tags"."id"
FROM "articles"
INNER JOIN "tags" ON "tags"."name" = btrim("articles"."tag")
WHERE NULLIF(btrim("articles"."tag"), '') IS NOT NULL
ON CONFLICT ("article_id", "tag_id") DO NOTHING;
--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "tag";--> statement-breakpoint
ALTER TABLE "articles" DROP COLUMN "tag_color";