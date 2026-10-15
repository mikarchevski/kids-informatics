import {
	pgTable,
	uuid,
	varchar,
	jsonb,
	timestamp,
	text,
	boolean,
	integer
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	username: varchar('username', { length: 50 }).unique().notNull(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const projects = pgTable('projects', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: uuid('user_id')
		.references(() => users.id)
		.notNull(),
	title: varchar('title', { length: 100 }).notNull(),
	blockState: jsonb('block_state').notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Таблица статей
export const articles = pgTable('articles', {
	id: uuid('id').defaultRandom().primaryKey(),

	// SEO и URL
	slug: varchar('slug', { length: 120 }).unique().notNull(),

	// Контент
	title: varchar('title', { length: 200 }).notNull(),
	subtitle: varchar('subtitle', { length: 200 }),
	excerpt: text('excerpt'), // Короткое описание для карточки
	content: text('content').notNull(), // Markdown-текст

	// Метаданные
	tag: varchar('tag', { length: 50 }), // "Для детей", "Родителям"
	tagColor: varchar('tag_color', { length: 7 }), // HEX (#4C97FF)
	readTime: varchar('read_time', { length: 20 }), // "3 мин"

	// Управление
	isPublished: boolean('is_published').default(false).notNull(),
	sortOrder: integer('sort_order').default(0), // Порядок в списке

	// Связи
	authorId: uuid('author_id').references(() => users.id), // Кто создал (nullable для импорта старых)

	// Даты
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 36 }).primaryKey(), // UUID как строка
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});
