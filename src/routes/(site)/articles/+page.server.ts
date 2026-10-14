import { db } from '#lib/db';
import { articles } from '#lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function load() {
	const allArticles = await db.query.articles.findMany({
		where: eq(articles.isPublished, true),
		orderBy: [desc(articles.sortOrder)],
		columns: {
			id: true,
			slug: true,
			title: true,
			subtitle: true,
			excerpt: true,
			tag: true,
			tagColor: true,
			readTime: true
		}
	});

	return { articles: allArticles };
}
