<script lang="ts">
	import { getArticleBySlug, articles } from '#lib/articles';
	import './slug.css';
	// В Svelte 5 параметры динамического маршрута (slug) приходят через $props()
	let { params }: { params: { slug: string } } = $props();

	const article = $derived(getArticleBySlug(params.slug));

	// Находим предыдущую и следующую статьи для навигации
	const currentIndex = $derived(articles.findIndex((a) => a.slug === params.slug));
	const prevArticle = $derived(currentIndex > 0 ? articles[currentIndex - 1] : null);
	const nextArticle = $derived(
		currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null
	);
</script>

<svelte:head>
	<title>{article?.title || 'Статья'} — Kids Informatics</title>
</svelte:head>

{#if article}
	<article class="detail-aritcle-full">
		<a href="/articles" class="back-link">← Все статьи</a>

		<header class="detail-aritcle-header">
			<span
				class="detail-aritcle-tag"
				style="background: {article.tagColor}20; color: {article.tagColor};"
			>
				{article.tag}
			</span>
			<span class="detail-aritcle-time">⏱️ {article.readTime}</span>
			<h1 class="detail-aritcle-title">{article.title}</h1>
			<h2 class="detail-aritcle-subtitle">{article.subtitle}</h2>
		</header>

		<div class="detail-aritcle-content">
			{@html article.content}
		</div>

		<nav class="detail-aritcle-nav">
			{#if prevArticle}
				<a href="/articles/{prevArticle.slug}" class="nav-link prev">
					<span class="nav-label">← Предыдущая</span>
					<span class="nav-title">{prevArticle.title}</span>
				</a>
			{:else}
				<div></div>
			{/if}

			{#if nextArticle}
				<a href="/articles/{nextArticle.slug}" class="nav-link next">
					<span class="nav-label">Следующая →</span>
					<span class="nav-title">{nextArticle.title}</span>
				</a>
			{:else}
				<div></div>
			{/if}
		</nav>
	</article>
{:else}
	<div class="not-found">
		<h1>🤖 Статья не найдена</h1>
		<p>Возможно, она была удалена или перемещена.</p>
		<a href="/articles" class="back-button">← Вернуться к списку статей</a>
	</div>
{/if}

<style>
</style>
