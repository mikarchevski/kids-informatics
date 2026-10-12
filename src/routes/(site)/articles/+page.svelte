<script lang="ts">
	import { articles } from '#lib/articles';
	import './articles.css';
</script>

<svelte:head>
	<title>Познавательные статьи — Kids Informatics</title>
</svelte:head>

<h1 class="page-title">📚 Познавательные статьи</h1>
<p class="page-intro">
	Увлекательные материалы о технологиях, логике и программировании простым языком.
</p>

<div class="articles-grid">
	{#each articles as article}
		<a href="/articles/{article.slug}" class="article-card">
			<div class="article-header">
				<span
					class="article-tag"
					style="background: {article.tagColor}20; color: {article.tagColor};"
				>
					{article.tag}
				</span>
				<span class="article-time">⏱️ {article.readTime}</span>
			</div>
			<h2 class="article-title">{article.title}</h2>
			<h3 class="article-subtitle">{article.subtitle}</h3>
			<p class="article-excerpt">{article.excerpt}</p>
			<span class="read-more">Читать статью →</span>
		</a>
	{/each}
</div>

<style>
</style>
