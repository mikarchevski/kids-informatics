// 1. ПРИНУДИТЕЛЬНО читаем .env файл напрямую
import { config } from 'dotenv';
config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('❌ ОШИБКА: DATABASE_URL не найдена даже после принудительной загрузки .env!');
}

const pool = new Pool({
	connectionString: databaseUrl
});

export const db = drizzle(pool, { schema });
