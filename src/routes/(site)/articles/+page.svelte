<script lang="ts">
	import type { PageData } from './$types';
	import './articles.css';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Познавательные статьи — Kids Informatics</title>
</svelte:head>

<h1 class="page-title">📚 Познавательные статьи</h1>
<p class="page-intro">
	Увлекательные материалы о технологиях, логике и программировании простым языком.
</p>

<div class="articles-grid">
	{#each data.articles as article}
		<a href="/articles/{article.slug}" class="article-card">
			<div class="article-header">
				{#each article.tags as tag (tag.id)}
					<span class="article-tag" style:--tag-color={tag.color}>
						{tag.name}
					</span>
				{/each}
				<span class="article-time">⏱️ {article.readTime}</span>
			</div>
			<h2 class="article-title">{article.title}</h2>
			<h3 class="article-subtitle">{article.subtitle}</h3>
			<p class="article-excerpt">{article.excerpt}</p>
			<span class="read-more">Читать статью →</span>
		</a>
	{/each}
</div>
