import { json } from '@sveltejs/kit';
import { db } from '#lib/db';
import { dictationLevels } from '#lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE({ params }) {
	try {
		await db.delete(dictationLevels).where(eq(dictationLevels.id, params.id));
		return json({ success: true });
	} catch (error) {
		console.error('Ошибка удаления уровня:', error);
		return json({ error: 'Failed to delete level' }, { status: 500 });
	}
}
