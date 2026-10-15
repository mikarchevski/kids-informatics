import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { articleTags, articles, tags } from '#lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db
		.select({
			article: articles,
			tagId: tags.id,
			tagName: tags.name,
			tagColor: tags.color
		})
		.from(articles)
		.leftJoin(articleTags, eq(articleTags.articleId, articles.id))
		.leftJoin(tags, eq(articleTags.tagId, tags.id))
		.orderBy(articles.sortOrder);
	type ArticleWithTags = (typeof rows)[number]['article'] & {
		tags: { id: string; name: string; color: string }[];
	};
	const articlesById = new Map<string, ArticleWithTags>();

	for (const row of rows) {
		let article = articlesById.get(row.article.id);
		if (!article) {
			article = { ...row.article, tags: [] };
			articlesById.set(article.id, article);
		}
		if (row.tagId && row.tagName && row.tagColor) {
			article.tags.push({ id: row.tagId, name: row.tagName, color: row.tagColor });
		}
	}

	return { articles: [...articlesById.values()] };
};

export const actions: Actions = {
	create_article: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString()?.trim();

		if (!title) return fail(400, { error: 'Заголовок обязателен' });

		await db.insert(articles).values({
			title,
			slug: title
				.toLowerCase()
				.replace(/[^a-zа-яё0-9]+/g, '-')
				.replace(/^-|-$/g, ''),
			content: '',
			isPublished: false,
			sortOrder: 100,
			readTime: '1 мин'
		});

		throw redirect(303, '/manage/articles');
	},

	delete_article: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString(); // ✅ string, не number!

		if (!id) return fail(400, { error: 'Некорректный ID' });

		await db.delete(articles).where(eq(articles.id, id));
		return { success: true };
	}
};
