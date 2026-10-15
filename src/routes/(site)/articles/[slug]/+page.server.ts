import { db } from '#lib/db';
import { articleTags, articles, tags } from '#lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const article = await db.query.articles.findFirst({
		where: eq(articles.slug, params.slug)
	});

	if (!article || !article.isPublished) {
		error(404, 'Статья не найдена');
	}
	const articleTagList = await db
		.select({ id: tags.id, name: tags.name, color: tags.color })
		.from(articleTags)
		.innerJoin(tags, eq(articleTags.tagId, tags.id))
		.where(eq(articleTags.articleId, article.id));

	// Загружаем ВСЕ опубликованные статьи для навигации
	const allArticles = await db.query.articles.findMany({
		where: eq(articles.isPublished, true),
		orderBy: [desc(articles.sortOrder)],
		columns: { id: true, slug: true, title: true }
	});

	return { article: { ...article, tags: articleTagList }, allArticles };
}
