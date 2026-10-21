import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('❌ ОШИБКА: DATABASE_URL не найдена в .env файле!');
}

// Защита от утечки соединений при Hot Module Replacement (HMR) в dev режиме
const globalForDb = globalThis as unknown as {
	pool: Pool | undefined;
	db: ReturnType<typeof drizzle> | undefined;
};

// Создаем пул только если его еще нет в глобальной области видимости
const pool = globalForDb.pool ?? new Pool({ connectionString: databaseUrl });
globalForDb.pool = pool;

export const db = globalForDb.db ?? drizzle(pool, { schema });
globalForDb.db = db;

// Если это production, очищаем глобальную ссылку (не обязательно, но полезно)
if (env.NODE_ENV === 'production') {
	globalForDb.pool = undefined;
	globalForDb.db = undefined;
}
