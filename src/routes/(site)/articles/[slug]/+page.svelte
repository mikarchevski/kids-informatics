<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import './articles.css';
	let { data }: { data: PageData } = $props();

	// Безопасный рендеринг HTML из базы
	const htmlContent = $derived(data.article ? marked(data.article.content) : '');

	// Навигация по массиву всех статей из load()
	const currentIndex = $derived(data.allArticles.findIndex((a) => a.slug === data.article?.slug));
	const prevArticle = $derived(currentIndex > 0 ? data.allArticles[currentIndex - 1] : null);
	const nextArticle = $derived(
		currentIndex < data.allArticles.length - 1 ? data.allArticles[currentIndex + 1] : null
	);
</script>

<svelte:head>
	<title>{data.article?.title || 'Статья'} — Kids Informatics</title>
</svelte:head>

{#if data.article}
	<article class="detail-article-full">
		<a href="/articles" class="back-link">← Все статьи</a>

		<header class="detail-article-header">
			{#each data.article.tags as tag (tag.id)}
				<span class="detail-article-tag" style="background: {tag.color}20; color: {tag.color};">
					{tag.name}
				</span>
			{/each}
			<span class="detail-article-time">⏱️ {data.article.readTime}</span>
			<h1 class="detail-article-title">{data.article.title}</h1>
			<h2 class="detail-article-subtitle">{data.article.subtitle}</h2>
		</header>

		<div class="detail-article-content">
			{@html htmlContent}
		</div>

		<nav class="detail-article-nav">
			{#if prevArticle}
				<a href="/articles/{prevArticle.slug}" class="nav-link prev">
					<span class="nav-label">← Предыдущая</span>
					<span class="nav-title">{prevArticle.title}</span>
				</a>
			{/if}

			{#if nextArticle}
				<a href="/articles/{nextArticle.slug}" class="nav-link next">
					<span class="nav-label">Следующая →</span>
					<span class="nav-title">{nextArticle.title}</span>
				</a>
			{/if}
		</nav>
	</article>
{:else}
	<div class="not-found">
		<h1>🤖 Статья не найдена</h1>
		<p>Проверьте URL или вернитесь к списку.</p>
		<a href="/articles" class="back-button">← К статьям</a>
	</div>
{/if}

<style>
</style>
