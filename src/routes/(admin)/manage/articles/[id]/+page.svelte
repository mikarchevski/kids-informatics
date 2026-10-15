<script lang="ts">
	import type { PageData } from './$types';
	import './page.css';
	import './layout.css';
	let { data, form }: { data: PageData; form?: any } = $props();
</script>

<div class="editor-container">
	<div class="editor-header">
		<a href="/manage/articles" class="back-link">← Назад к списку</a>
		<h1>Редактирование статьи</h1>
	</div>

	{#if form?.error}
		<div class="alert alert-error">{form.error}</div>
	{/if}

	{#if form?.success}
		<div class="alert alert-success">✅ Статья сохранена!</div>
	{/if}

	<form method="POST" action="?/save_article" class="editor-form">
		<div class="form-group">
			<label for="title">Заголовок</label>
			<input id="title" name="title" value={data.article.title} required class="form-input" />
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="tag">Тег</label>
				<input id="tag" name="tag" value={data.article.tag} class="form-input" />
			</div>

			<div class="form-group">
				<label for="sortOrder">Порядок сортировки</label>
				<input
					id="sortOrder"
					name="sortOrder"
					type="number"
					value={data.article.sortOrder}
					class="form-input"
				/>
			</div>
		</div>

		<div class="form-group checkbox-group">
			<label class="checkbox-label">
				<input type="checkbox" name="isPublished" checked={data.article.isPublished} />
				<span>Опубликовать статью</span>
			</label>
		</div>

		<div class="form-group">
			<label for="content">Содержание (HTML)</label>
			<textarea id="content" name="content" rows={15} class="form-textarea"
				>{data.article.content}</textarea
			>
			<small class="hint">Поддерживается HTML. Позже здесь будет визуальный редактор.</small>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn btn-primary">💾 Сохранить изменения</button>
			<a href="/articles/{data.article.slug}" target="_blank" class="btn btn-secondary">
				👁️ Предпросмотр
			</a>
		</div>
	</form>
</div>

<style>
</style>
