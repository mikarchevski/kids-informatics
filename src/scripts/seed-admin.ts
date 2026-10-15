import { db } from '#lib/db';
import { users } from '#lib/db/schema';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
	const username = 'admin@example.com';
	const password = 'admin123'; // Пароль по умолчанию

	// Генерируем безопасный хеш пароля
	const passwordHash = await bcrypt.hash(password, 10);

	try {
		await db.insert(users).values({
			username,
			passwordHash
		});

		console.log('✅ Администратор успешно создан!');
		console.log('👤 Логин:', username);
		console.log('🔑 Пароль:', password);
		console.log('⚠️ Не забудьте сменить пароль после первого входа!');
	} catch (error: any) {
		if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
			console.log('⚠️ Пользователь с именем "admin" уже существует в базе.');
		} else {
			console.error('❌ Ошибка при создании админа:', error);
		}
	}
}

seedAdmin();
