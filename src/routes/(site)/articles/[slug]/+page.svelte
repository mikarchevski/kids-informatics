<script lang="ts">
	import type { PageData } from './$types';
	import Seo from '#lib/components/Seo.svelte';
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

{#if data.article}
	<Seo
		title="{data.article.title} — Kids Informatics"
		description={data.article.excerpt || data.article.subtitle || data.article.title}
		path="/articles/{data.article.slug}"
		type="article"
		schema={{
			'@type': 'Article',
			headline: data.article.title,
			description: data.article.excerpt || data.article.subtitle || data.article.title,
			datePublished: data.article.createdAt.toISOString(),
			dateModified: data.article.updatedAt.toISOString(),
			mainEntityOfPage: `https://kids-informatics.mk5d.ru/articles/${encodeURIComponent(data.article.slug)}`,
			author: { '@type': 'Organization', name: 'Kids Informatics' },
			publisher: { '@id': 'https://kids-informatics.mk5d.ru/#organization' },
			inLanguage: 'ru-RU'
		}}
	/>

	<article class="article-page">
		<a href="/articles" class="article-page__back-link">← Все статьи</a>

		<header class="article-page__header">
			{#each data.article.tags as tag (tag.id)}
				<span class="article-page__tag" style:--tag-color={tag.color}>
					{tag.name}
				</span>
			{/each}

			<span class="article-page__time">⏱️ {data.article.readTime}</span>
			<h1 class="article-page__title">{data.article.title}</h1>
			<h2 class="article-page__subtitle">{data.article.subtitle}</h2>
		</header>

		<div class="article-page__content">
			{@html htmlContent}
		</div>

		<nav class="article-page__nav">
			{#if prevArticle}
				<a
					href="/articles/{prevArticle.slug}"
					class="article-page__nav-link article-page__nav-link--prev"
				>
					<span class="article-page__nav-label">← Предыдущая</span>
					<span class="article-page__nav-title">{prevArticle.title}</span>
				</a>
			{/if}

			{#if nextArticle}
				<a
					href="/articles/{nextArticle.slug}"
					class="article-page__nav-link article-page__nav-link--next"
				>
					<span class="article-page__nav-label">Следующая →</span>
					<span class="article-page__nav-title">{nextArticle.title}</span>
				</a>
			{/if}
		</nav>
	</article>
{:else}
	<div class="not-found">
		<h1 class="not-found__title">🤖 Статья не найдена</h1>
		<p class="not-found__description">Проверьте URL или вернитесь к списку.</p>
		<a href="/articles" class="not-found__link">← К статьям</a>
	</div>
{/if}
