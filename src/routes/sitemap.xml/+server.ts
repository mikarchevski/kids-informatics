import { db } from '#lib/db';
import { articles } from '#lib/db/schema';
import { SITE_URL } from '#lib/seo';
import { desc, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const staticPaths = [
	'/',
	'/articles',
	'/parents',
	'/legal',
	'/car-play',
	'/mouse-trainer',
	'/mouse-trainer/aim',
	'/mouse-trainer/bubbles',
	'/mouse-trainer/double-click',
	'/mouse-trainer/drag',
	'/mouse-trainer/feed-animals',
	'/mouse-trainer/scroll'
];

function escapeXml(value: string) {
	return value.replace(/[<>&"']/g, (character) => {
		const entities: Record<string, string> = {
			'<': '&lt;',
			'>': '&gt;',
			'&': '&amp;',
			'"': '&quot;',
			"'": '&apos;'
		};
		return entities[character];
	});
}

export const GET: RequestHandler = async () => {
	const publishedArticles = await db
		.select({ slug: articles.slug, updatedAt: articles.updatedAt })
		.from(articles)
		.where(eq(articles.isPublished, true))
		.orderBy(desc(articles.updatedAt));

	const staticEntries = staticPaths.map((path) => ({
		loc: new URL(path, SITE_URL).href
	}));
	const articleEntries = publishedArticles.map((article) => ({
		loc: new URL(`/articles/${encodeURIComponent(article.slug)}`, SITE_URL).href,
		lastmod: article.updatedAt.toISOString()
	}));
	const urls = [...staticEntries, ...articleEntries]
		.map(
			(entry) =>
				`<url><loc>${escapeXml(entry.loc)}</loc>${'lastmod' in entry ? `<lastmod>${entry.lastmod}</lastmod>` : ''}</url>`
		)
		.join('');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
		{
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=0, s-maxage=3600'
			}
		}
	);
};
