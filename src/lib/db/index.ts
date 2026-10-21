import { config } from 'dotenv';
import { resolve } from 'node:path';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// .env ищем от process.cwd() (корень проекта и в dev, и на сервере),
// а НЕ от расположения файла — в сборке файл живёт в .svelte-kit/output/...
config({ path: resolve(process.cwd(), '.env') });

const globalForDb = globalThis as unknown as {
	pool?: Pool;
	db?: NodePgDatabase<typeof schema>;
};

function createDb(): NodePgDatabase<typeof schema> {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error(
			'❌ DATABASE_URL не найдена! Задайте переменную окружения ' +
				'(systemd EnvironmentFile / PM2 env) или .env в корне проекта.'
		);
	}
	const pool = new Pool({ connectionString: databaseUrl });
	return drizzle(pool, { schema });
}

// Ленивая инициализация через Proxy: импорт модуля БЕЗОПАСЕН без env
// (build/analyse больше не падает), подключение создаётся при первом запросе.
// API прежнее: db.select(), db.insert() и т.д.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
	get(_target, prop) {
		const instance = (globalForDb.db ??= createDb());
		const value = Reflect.get(instance, prop);
		return typeof value === 'function' ? value.bind(instance) : value;
	}
});
