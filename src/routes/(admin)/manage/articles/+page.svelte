<script lang="ts">
	import type { PageData } from './$types';

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
							<span class="tag-badge" style="background: {article.tagColor}">
								{article.tag}
							</span>
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

<style>
	.admin-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	.admin-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	.inline-form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.admin-input {
		padding: 0.5rem 1rem;
		border: 1px solid #ddd;
		border-radius: 6px;
		min-width: 300px;
	}
	.admin-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	.admin-table th {
		background: #f8f9fa;
		padding: 1rem;
		text-align: left;
		font-weight: 600;
		color: #495057;
	}
	.admin-table td {
		padding: 1rem;
		border-top: 1px solid #eee;
		vertical-align: middle;
	}
	.link-title {
		color: #2c3e50;
		text-decoration: none;
		font-weight: 500;
	}
	.link-title:hover {
		color: #3498db;
	}
	.tag-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		color: white;
		font-size: 0.85rem;
	}
	.status-badge {
		padding: 0.25rem 0.75rem;
		border-radius: 6px;
		font-size: 0.85rem;
	}
	.status-badge.published {
		background: #d4edda;
		color: #155724;
	}
	.status-badge:not(.published) {
		background: #fff3cd;
		color: #856404;
	}
	.actions-cell {
		display: flex;
		gap: 0.5rem;
	}
	.btn-sm {
		padding: 0.4rem 0.8rem;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 1rem;
	}
	.btn-edit {
		background: #e3f2fd;
		color: #1976d2;
	}
	.btn-delete {
		background: #ffebee;
		color: #c62828;
	}
	.empty-state {
		text-align: center;
		padding: 4rem;
		color: #6c757d;
		font-size: 1.1rem;
	}
</style>
