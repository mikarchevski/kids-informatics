import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Вычисляем абсолютный путь к .env от текущего файла
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env');

// Явно читаем .env ДО обращения к process.env
const result = config({ path: envPath });

if (result.error) {
	console.error('⚠️ Ошибка чтения .env:', result.error.message);
} else if (result.parsed) {
	// Принудительно пробрасываем распарсенные значения в process.env
	// (это защита от того, что Vite их не инжектнул)
	for (const [key, value] of Object.entries(result.parsed)) {
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error(
		`❌ DATABASE_URL не найдена!\n` +
			`dotenv result: ${result.error?.message ?? 'parsed ' + Object.keys(result.parsed ?? {}).length + ' keys'}\n` +
			`envPath: ${envPath}\n` +
			`process.cwd(): ${process.cwd()}`
	);
}

// Singleton-пул для защиты от утечек при HMR
const globalForDb = globalThis as unknown as {
	pool?: Pool;
	db?: ReturnType<typeof drizzle>;
};

const pool = globalForDb.pool ?? new Pool({ connectionString: databaseUrl });
globalForDb.pool = pool;

export const db = globalForDb.db ?? drizzle(pool, { schema });
globalForDb.db = db;
