import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { articles } from '#lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const list = await db.select().from(articles).orderBy(articles.sortOrder);
	return { articles: list };
};

export const actions: Actions = {
	create_article: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString()?.trim();

		if (!title) return fail(400, { error: 'Заголовок обязателен' });

		// ✅ Все обязательные поля заполнены
		await db.insert(articles).values({
			title,
			slug: title
				.toLowerCase()
				.replace(/[^a-zа-яё0-9]+/g, '-')
				.replace(/^-|-$/g, ''),
			content: '', // Обязательно! Поле notNull()
			isPublished: false,
			sortOrder: 100,
			readTime: '1 мин'
		});

		throw redirect(303, '/manage/articles');
	},

	delete_article: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString(); // ✅ string, а не number

		if (!id) return fail(400, { error: 'Некорректный ID' });

		await db.delete(articles).where(eq(articles.id, id));
		return { success: true };
	}
};
