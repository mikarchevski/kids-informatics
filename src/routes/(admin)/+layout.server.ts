import { redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { sessions, users } from '#lib/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Разрешаем доступ к логину и логауту без сессии
	if (url.pathname === '/login' || url.pathname === '/logout') {
		return {};
	}

	const sessionId = cookies.get('session_id');

	if (!sessionId) {
		throw redirect(302, '/login');
	}

	const sessionData = await db
		.select({ user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.id, sessionId), gte(sessions.expiresAt, new Date())))
		.limit(1);

	if (!sessionData || sessionData.length === 0) {
		cookies.delete('session_id', { path: '/' });
		throw redirect(302, '/login');
	}

	return { user: sessionData[0].user };
};
