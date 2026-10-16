<script lang="ts">
	import { enhance } from '$app/forms';
	import { getReadTime } from '#lib/articles/content';
	import RichEditor from '../../../../../lib/components/RichEditor.svelte';
	import { untrack } from 'svelte';
	import type { PageData } from './$types';
	import './page.css';
	let { data, form }: { data: PageData; form?: any } = $props();

	type Tag = PageData['tags'][number];
	let availableTags = $state(untrack(() => data.tags));
	let selectedTagIds = $state(untrack(() => data.article.tags.map((tag) => tag.id)));
	let tagSearch = $state('');
	let isTagMenuOpen = $state(false);
	let tagError = $state<string | null>(null);
	let createTagForm = $state<HTMLFormElement>();
	let articleForm = $state<HTMLFormElement>();
	let articleTitle = $state(untrack(() => data.article.title));
	let articleContent = $state(untrack(() => data.article.content));
	let wordCount = $state(0);
	let isPublished = $state(untrack(() => data.article.isPublished));
	let isPreviewOpen = $state(false);
	let saveStatus = $state<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');
	let isSaving = false;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;
	let changeVersion = 0;

	$effect(() => {
		availableTags = data.tags;
		selectedTagIds = data.article.tags.map((tag) => tag.id);
	});

	const matchingTags = $derived(
		availableTags.filter((tag) =>
			tag.name.toLocaleLowerCase().includes(tagSearch.trim().toLocaleLowerCase())
		)
	);

	function addTag(tagId: string) {
		if (!selectedTagIds.includes(tagId)) selectedTagIds = [...selectedTagIds, tagId];
		tagSearch = '';
		tagError = null;
		scheduleDraftSave();
	}

	function scheduleDraftSave() {
		changeVersion += 1;
		saveStatus = 'unsaved';
		if (saveTimer) clearTimeout(saveTimer);

		if (data.article.isPublished || isPublished) return;

		saveTimer = setTimeout(() => {
			if (isSaving) {
				scheduleDraftSave();
				return;
			}
			articleForm?.requestSubmit();
		}, 1000);
	}

	function escapeHtml(value: string) {
		return value.replace(/[&<>"']/g, (character) => {
			const entities: Record<string, string> = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;'
			};
			return entities[character];
		});
	}

	const previewDocument = $derived(`<!doctype html>
		<html lang="ru">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<link rel="stylesheet" href="/article-preview.css">
			</head>
			<body><article><h1>${escapeHtml(articleTitle)}</h1>${articleContent}</article></body>
		</html>`);

	function handleTagKeydown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		if (!tagSearch.trim()) return;

		const existingTag = availableTags.find(
			(tag) => tag.name.toLocaleLowerCase() === tagSearch.trim().toLocaleLowerCase()
		);
		if (existingTag) {
			addTag(existingTag.id);
			return;
		}

		const firstMatch = matchingTags[0];
		if (firstMatch) {
			addTag(firstMatch.id);
			return;
		}

		createTagForm?.requestSubmit();
	}

	function isTag(value: unknown): value is Tag {
		return (
			typeof value === 'object' &&
			value !== null &&
			'id' in value &&
			'name' in value &&
			'color' in value &&
			typeof value.id === 'string' &&
			typeof value.name === 'string' &&
			typeof value.color === 'string'
		);
	}
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

	<form
		id="article-form"
		bind:this={articleForm}
		method="POST"
		action="?/save_article"
		class="editor-form"
		oninput={scheduleDraftSave}
		onchange={scheduleDraftSave}
		use:enhance={() => {
			isSaving = true;
			saveStatus = 'saving';
			const submittedVersion = changeVersion;

			return async ({ result, update }) => {
				await update({ reset: false, invalidateAll: false });
				isSaving = false;
				if (result.type === 'success') {
					saveStatus = changeVersion === submittedVersion ? 'saved' : 'unsaved';
				} else {
					saveStatus = 'error';
				}
			};
		}}
	>
		<div class="form-group">
			<label for="title">Заголовок</label>
			<input
				id="title"
				name="title"
				bind:value={articleTitle}
				required
				maxlength="200"
				class="form-input"
			/>
		</div>

		<div class="form-row">
			<div class="form-group">
				<label for="tag-search">Теги</label>
				<div class="tag-picker">
					<div class="selected-tags">
						{#each availableTags.filter((tag) => selectedTagIds.includes(tag.id)) as tag (tag.id)}
							<span class="selected-tag" style:--tag-color={tag.color}>
								{tag.name}
								<button
									type="button"
									class="remove-tag"
									aria-label="Удалить тег {tag.name}"
									onclick={() => {
										selectedTagIds = selectedTagIds.filter((id) => id !== tag.id);
										scheduleDraftSave();
									}}
								>
									×
								</button>
							</span>
						{/each}
					</div>
					<input
						id="tag-search"
						name="name"
						form="create-tag-form"
						maxlength="50"
						autocomplete="off"
						placeholder="Найти или создать тег..."
						class="form-input"
						bind:value={tagSearch}
						onfocus={() => (isTagMenuOpen = true)}
						onclick={() => (isTagMenuOpen = true)}
						onblur={() => window.setTimeout(() => (isTagMenuOpen = false), 100)}
						onkeydown={handleTagKeydown}
					/>
					{#if isTagMenuOpen}
						<div class="tag-options">
							{#each matchingTags as tag (tag.id)}
								<button
									type="button"
									class="tag-option"
									class:tag-selected={selectedTagIds.includes(tag.id)}
									onmousedown={(event) => event.preventDefault()}
									onclick={() => addTag(tag.id)}
								>
									{tag.name}
									{#if selectedTagIds.includes(tag.id)}<span>Добавлен</span>{/if}
								</button>
							{/each}
							{#if !tagSearch.trim()}
								{#if matchingTags.length === 0}
									<div class="tag-option tag-empty">Тегов пока нет</div>
								{/if}
							{:else if matchingTags.length === 0}
								<button type="submit" form="create-tag-form" class="tag-option create-tag-option">
									+ Создать «{tagSearch.trim()}»
								</button>
							{/if}
						</div>
					{/if}
					{#each selectedTagIds as tagId (tagId)}
						<input type="hidden" name="tagIds" value={tagId} form="article-form" />
					{/each}
				</div>
				{#if tagError}
					<p class="tag-error">{tagError}</p>
				{/if}
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
				<input type="checkbox" name="isPublished" bind:checked={isPublished} />
				<span>Опубликовать статью</span>
			</label>
		</div>

		<div class="form-group">
			<p class="field-label">Содержание статьи</p>
			<RichEditor
				bind:content={articleContent}
				bind:wordCount
				oncontentchange={scheduleDraftSave}
			/>
			<small class="hint">
				{wordCount} слов · около {getReadTime(articleContent.replace(/<[^>]*>/g, ' '))} чтения. Заголовок
				статьи отображается как H1.
			</small>
		</div>

		<div class="form-actions">
			<button type="submit" class="btn btn-primary">💾 Сохранить</button>
			<button
				type="button"
				class="btn btn-secondary"
				onclick={() => (isPreviewOpen = !isPreviewOpen)}
			>
				👁️ {isPreviewOpen ? 'Скрыть предпросмотр' : 'Предпросмотр'}
			</button>
			<span class="save-status" aria-live="polite">
				{#if saveStatus === 'saving'}
					Сохранение…
				{:else if saveStatus === 'saved'}
					Сохранено
				{:else if saveStatus === 'unsaved'}
					{data.article.isPublished || isPublished
						? 'Есть несохранённые изменения'
						: 'Черновик сохранится автоматически'}
				{:else if saveStatus === 'error'}
					Не удалось сохранить
				{/if}
			</span>
		</div>
	</form>

	{#if isPreviewOpen}
		<section class="preview-panel" aria-label="Предпросмотр статьи">
			<h2>Предпросмотр статьи</h2>
			<iframe
				title="Предпросмотр статьи"
				srcdoc={previewDocument}
				sandbox=""
				referrerpolicy="no-referrer"
			></iframe>
		</section>
	{/if}

	<form
		id="create-tag-form"
		bind:this={createTagForm}
		method="POST"
		action="?/create_tag"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success' && result.data && 'tag' in result.data) {
					const tag = result.data.tag;
					if (isTag(tag)) {
						if (!availableTags.some((item) => item.id === tag.id)) {
							availableTags = [...availableTags, tag].sort((a, b) => a.name.localeCompare(b.name));
						}
						addTag(tag.id);
					}
				} else if (result.type === 'failure' && result.data && 'tagError' in result.data) {
					tagError =
						typeof result.data.tagError === 'string'
							? result.data.tagError
							: 'Не удалось создать тег';
				}

				await update({ reset: false, invalidateAll: false });
			};
		}}
	></form>
</div>
