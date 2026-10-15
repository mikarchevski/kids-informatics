import { redirect } from '@sveltejs/kit';
import { db } from '#lib/db';
import { sessions } from '#lib/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const sessionId = cookies.get('session_id');

	if (sessionId) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
	}

	cookies.delete('session_id', { path: '/' });
	throw redirect(302, '/login');
};
