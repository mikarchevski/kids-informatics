import { fail, redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { users, sessions } from '#lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString()?.trim().toLowerCase();
		const password = formData.get('password')?.toString();

		if (!email || !password) {
			return fail(400, { error: 'Заполните все поля' });
		}

		// ✅ Правильный способ получения пользователя
		const userData = await db
			.select()
			.from(users)
			.where(eq(users.username, email)) // или users.email, если есть такое поле
			.limit(1);

		if (!userData || userData.length === 0) {
			return fail(401, { error: 'Неверный email или пароль' });
		}

		const user = userData[0];

		// Проверка пароля
		const isValid = await bcrypt.compare(password, user.passwordHash);
		if (!isValid) {
			return fail(401, { error: 'Неверный email или пароль' });
		}

		// Создание сессии
		const sessionId = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

		await db.insert(sessions).values({
			id: sessionId,
			userId: user.id,
			expiresAt
		});

		cookies.set('session_id', sessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(302, '/manage/articles');
	}
};
