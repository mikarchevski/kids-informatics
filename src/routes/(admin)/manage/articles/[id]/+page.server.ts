import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { articles } from '#lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = params.id; // ✅ Оставляем как string (uuid)

	if (!id) throw redirect(302, '/manage/articles');

	const articleData = await db.select().from(articles).where(eq(articles.id, id)).limit(1);

	if (!articleData || articleData.length === 0) {
		throw redirect(302, '/manage/articles');
	}

	return { article: articleData[0] };
};

export const actions: Actions = {
	save_article: async ({ request, params }) => {
		const formData = await request.formData();
		const id = params.id; // ✅ string

		const title = formData.get('title')?.toString()?.trim();
		const content = formData.get('content')?.toString() || '';
		const tag = formData.get('tag')?.toString() || '';
		const sortOrder = Number(formData.get('sortOrder')) || 0;
		const isPublished = formData.get('isPublished') === 'on';

		if (!title) return fail(400, { error: 'Заголовок обязателен' });

		await db
			.update(articles)
			.set({
				title,
				slug: title
					.toLowerCase()
					.replace(/[^a-zа-яё0-9]+/g, '-')
					.replace(/^-|-$/g, ''),
				content,
				tag,
				sortOrder,
				isPublished,
				updatedAt: new Date()
			})
			.where(eq(articles.id, id));

		return { success: true };
	}
};
