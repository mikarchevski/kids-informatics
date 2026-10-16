<script lang="ts">
	import type { PageData } from './$types';
	import './page.css';

	let { data }: { data: PageData } = $props();
</script>

<div class="admin-container">
	<div class="admin-header">
		<h1>📝 Управление статьями</h1>
		<form method="POST" action="?/create_article" class="inline-form">
			<input name="title" placeholder="Название новой статьи..." required class="admin-input" />
			<button type="submit" class="btn btn-primary">+ Создать</button>
		</form>
	</div>

	{#if data.articles.length === 0}
		<div class="empty-state">
			<p>Статей пока нет. Создайте первую!</p>
		</div>
	{:else}
		<table class="admin-table">
			<thead>
				<tr>
					<th>Заголовок</th>
					<th>Тег</th>
					<th>Порядок</th>
					<th>Статус</th>
					<th>Действия</th>
				</tr>
			</thead>
			<tbody>
				{#each data.articles as article}
					<tr>
						<td class="title-cell">
							<a href="/manage/articles/{article.id}" class="link-title">
								{article.title}
							</a>
						</td>
						<td>
							{#each article.tags as tag (tag.id)}
								<span class="tag-badge" style:--tag-color={tag.color}>{tag.name}</span>
							{:else}
								<span class="tag-badge">Без тега</span>
							{/each}
						</td>
						<td>{article.sortOrder}</td>
						<td>
							<span class="status-badge" class:published={article.isPublished}>
								{article.isPublished ? '✅ Опубликовано' : '⏳ Черновик'}
							</span>
						</td>
						<td class="actions-cell">
							<a href="/manage/articles/{article.id}" class="btn btn-sm btn-edit">✏️</a>
							<form method="POST" action="?/delete_article" class="inline-form">
								<input type="hidden" name="id" value={article.id} />
								<button
									type="submit"
									class="btn btn-sm btn-delete"
									onclick={(e: MouseEvent) => {
										if (!confirm(`Удалить статью «${article.title}»?`)) {
											e.preventDefault();
										}
									}}
								>
									🗑️
								</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
