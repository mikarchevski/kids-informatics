import { expect, test } from '@playwright/test';

test('has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

test('game page is server-rendered with its own SEO metadata', async ({ page }) => {
	const response = await page.goto('/car-play');
	const html = await response?.text();

	expect(response?.status()).toBe(200);
	expect(html).toContain('<title>Программирование для детей: играй и составляй алгоритмы</title>');
	expect(html).toContain(
		'<link rel="canonical" href="https://kids-informatics.mk5d.ru/car-play"/>'
	);
	expect(html).toContain('Программное приключение');
	expect(html).toContain('"@type":"WebApplication"');
	await expect(page.getByRole('heading', { name: /Программное приключение/ })).toBeVisible();
	await page.getByRole('button', { name: 'Добавить команду: Вперёд' }).click();
	await expect(page.getByLabel('Добавленные команды').getByText('Вперёд')).toBeVisible();
});

test('admin login is excluded from search indexing', async ({ page }) => {
	await page.goto('/login');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('not-found pages are excluded without a homepage canonical URL', async ({ page }) => {
	const response = await page.goto('/this-page-does-not-exist');

	expect(response?.status()).toBe(404);
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});
