import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { articleTags, articles, tags } from '#lib/db/schema';
import { getReadTimeFromHtml } from '#lib/articles/content';
import { eq, inArray } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id; // ✅ Оставляем как string (uuid)

	if (!id) throw redirect(302, '/manage/articles');

	const [articleData, articleTagsData, allTags] = await Promise.all([
		db.select().from(articles).where(eq(articles.id, id)).limit(1),
		db
			.select({ id: tags.id, name: tags.name, color: tags.color })
			.from(articleTags)
			.innerJoin(tags, eq(articleTags.tagId, tags.id))
			.where(eq(articleTags.articleId, id)),
		db.select().from(tags).orderBy(tags.name)
	]);

	if (!articleData || articleData.length === 0) {
		throw redirect(302, '/manage/articles');
	}

	return { article: { ...articleData[0], tags: articleTagsData }, tags: allTags };
};

export const actions: Actions = {
	create_tag: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim();

		if (!name) return fail(400, { tagError: 'Введите название тега' });
		if (name.length > 50) {
			return fail(400, { tagError: 'Название тега не должно превышать 50 символов' });
		}

		const [createdTag] = await db
			.insert(tags)
			.values({ name })
			.onConflictDoNothing({ target: tags.name })
			.returning();
		const tag = createdTag ?? (await db.select().from(tags).where(eq(tags.name, name)).limit(1))[0];

		if (!tag) throw new Error('Не удалось создать тег');

		return { tag };
	},

	save_article: async ({ request, params }) => {
		const formData = await request.formData();
		const id = params.id; // ✅ string

		const title = formData.get('title')?.toString()?.trim();
		const content = formData.get('content')?.toString() || '';
		const tagIds = [...new Set(formData.getAll('tagIds').map((value) => value.toString()))];
		const sortOrder = Number(formData.get('sortOrder')) || 0;
		const isPublished = formData.get('isPublished') === 'on';

		if (!title) return fail(400, { error: 'Заголовок обязателен' });
		if (
			tagIds.some(
				(tagId) =>
					!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tagId)
			)
		) {
			return fail(400, { error: 'Некорректный список тегов' });
		}

		if (tagIds.length > 0) {
			const matchingTags = await db
				.select({ id: tags.id })
				.from(tags)
				.where(inArray(tags.id, tagIds));
			if (matchingTags.length !== tagIds.length) {
				return fail(400, { error: 'Один из выбранных тегов не найден' });
			}
		}

		await db.transaction(async (tx) => {
			await tx
				.update(articles)
				.set({
					title,
					slug: title
						.toLowerCase()
						.replace(/[^a-zа-яё0-9]+/g, '-')
						.replace(/^-|-$/g, ''),
					content,
					readTime: getReadTimeFromHtml(content),
					sortOrder,
					isPublished,
					updatedAt: new Date()
				})
				.where(eq(articles.id, id));

			await tx.delete(articleTags).where(eq(articleTags.articleId, id));
			if (tagIds.length > 0) {
				await tx.insert(articleTags).values(tagIds.map((tagId) => ({ articleId: id, tagId })));
			}
		});

		return { success: true };
	}
};
