import { db } from '#lib/db';
import { articleTags, articles, tags } from '#lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function load() {
	const rows = await db
		.select({
			id: articles.id,
			slug: articles.slug,
			title: articles.title,
			subtitle: articles.subtitle,
			excerpt: articles.excerpt,
			readTime: articles.readTime,
			tagId: tags.id,
			tagName: tags.name,
			tagColor: tags.color
		})
		.from(articles)
		.leftJoin(articleTags, eq(articleTags.articleId, articles.id))
		.leftJoin(tags, eq(articleTags.tagId, tags.id))
		.where(eq(articles.isPublished, true))
		.orderBy(desc(articles.sortOrder));
	type ArticleWithTags = {
		id: string;
		slug: string;
		title: string;
		subtitle: string | null;
		excerpt: string | null;
		readTime: string | null;
		tags: { id: string; name: string; color: string }[];
	};
	const articlesById = new Map<string, ArticleWithTags>();

	for (const row of rows) {
		let article = articlesById.get(row.id);
		if (!article) {
			article = {
				id: row.id,
				slug: row.slug,
				title: row.title,
				subtitle: row.subtitle,
				excerpt: row.excerpt,
				readTime: row.readTime,
				tags: []
			};
			articlesById.set(article.id, article);
		}
		if (row.tagId && row.tagName && row.tagColor) {
			article.tags.push({ id: row.tagId, name: row.tagName, color: row.tagColor });
		}
	}

	return { articles: [...articlesById.values()] };
}
