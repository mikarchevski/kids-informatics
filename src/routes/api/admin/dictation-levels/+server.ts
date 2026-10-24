import { json } from '@sveltejs/kit';
import { db } from '#lib/db';
import { dictationLevels } from '#lib/db/schema';

export async function GET() {
	try {
		const levels = await db.select().from(dictationLevels).orderBy(dictationLevels.createdAt);
		return json(levels);
	} catch (error) {
		console.error('Ошибка загрузки уровней:', error);
		return json({ error: 'Failed to load levels' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const data = await request.json();

		const [newLevel] = await db
			.insert(dictationLevels)
			.values({
				name: data.name,
				emoji: data.emoji,
				description: data.description,
				gridSize: data.gridSize,
				startX: data.startX || 0,
				startY: data.startY || 0,
				commands: data.commands,
				isActive: true
			})
			.returning();

		return json(newLevel, { status: 201 });
	} catch (error) {
		console.error('Ошибка сохранения уровня:', error);
		return json({ error: 'Failed to save level' }, { status: 500 });
	}
}
