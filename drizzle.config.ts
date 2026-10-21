// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Здесь dotenv.config() отработает нормально, т.к. вызывается напрямую из Node.js
config({ path: '.env' });

export default defineConfig({
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
