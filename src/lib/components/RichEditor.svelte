<script lang="ts">
	import { getWordCount } from '#lib/articles/content';
	import { Editor } from '@tiptap/core';
	import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
	import Image from '@tiptap/extension-image';
	import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
	import StarterKit from '@tiptap/starter-kit';
	import { common, createLowlight } from 'lowlight';
	import { onMount } from 'svelte';

	const lowlight = createLowlight(common);

	let {
		content = $bindable(''),
		wordCount = $bindable(0),
		oncontentchange
	}: { content?: string; wordCount?: number; oncontentchange?: () => void } = $props();
	let editorElement: HTMLDivElement;
	let editor = $state<Editor | null>(null);
	let codeLanguage = $state('javascript');
	let imageUrl = $state('');
	let imageAlt = $state('');
	let imageError = $state('');
	let active = $state({
		bold: false,
		italic: false,
		heading2: false,
		heading3: false,
		bulletList: false,
		orderedList: false,
		blockquote: false,
		codeBlock: false
	});

	function syncToolbarState(instance: Editor) {
		active = {
			bold: instance.isActive('bold'),
			italic: instance.isActive('italic'),
			heading2: instance.isActive('heading', { level: 2 }),
			heading3: instance.isActive('heading', { level: 3 }),
			bulletList: instance.isActive('bulletList'),
			orderedList: instance.isActive('orderedList'),
			blockquote: instance.isActive('blockquote'),
			codeBlock: instance.isActive('codeBlock')
		};
	}

	function insertImage() {
		const src = imageUrl.trim();
		let url: URL;

		try {
			url = new URL(src);
		} catch {
			imageError = 'Введите корректный адрес изображения';
			return;
		}

		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			imageError = 'Разрешены только ссылки HTTP и HTTPS';
			return;
		}

		editor?.chain().focus().setImage({ src: url.href, alt: imageAlt.trim() }).run();
		imageUrl = '';
		imageAlt = '';
		imageError = '';
	}

	onMount(() => {
		const instance = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3] } }),
				CodeBlockLowlight.configure({ lowlight }),
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
				Image.configure({ allowBase64: false })
			],
			content,
			onUpdate: ({ editor }) => {
				content = editor.getHTML();
				wordCount = getWordCount(editor.getText());
				oncontentchange?.();
				syncToolbarState(editor);
			},
			onSelectionUpdate: ({ editor }) => syncToolbarState(editor),
			onTransaction: ({ editor }) => syncToolbarState(editor)
		});
		editor = instance;
		wordCount = getWordCount(instance.getText());

		return () => instance.destroy();
	});
</script>

<div class="rich-editor">
	<div class="editor-toolbar" role="toolbar" aria-label="Форматирование текста">
		<button
			type="button"
			class:active={active.bold}
			aria-label="Жирный"
			aria-pressed={active.bold}
			onclick={() => editor?.chain().focus().toggleBold().run()}><strong>Ж</strong></button
		>
		<button
			type="button"
			class:active={active.italic}
			aria-label="Курсив"
			aria-pressed={active.italic}
			onclick={() => editor?.chain().focus().toggleItalic().run()}><em>К</em></button
		>
		<button
			type="button"
			class:active={active.heading2}
			aria-label="Заголовок второго уровня"
			aria-pressed={active.heading2}
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button
		>
		<button
			type="button"
			class:active={active.heading3}
			aria-label="Заголовок третьего уровня"
			aria-pressed={active.heading3}
			onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button
		>
		<button
			type="button"
			class:active={active.bulletList}
			aria-label="Маркированный список"
			aria-pressed={active.bulletList}
			onclick={() => editor?.chain().focus().toggleBulletList().run()}>• Список</button
		>
		<button
			type="button"
			class:active={active.orderedList}
			aria-label="Нумерованный список"
			aria-pressed={active.orderedList}
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}>1. Список</button
		>
		<button
			type="button"
			class:active={active.blockquote}
			aria-label="Цитата"
			aria-pressed={active.blockquote}
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}>Цитата</button
		>
		<label class="language-picker">
			Язык кода
			<select bind:value={codeLanguage}>
				<option value="javascript">JavaScript</option>
				<option value="python">Python</option>
				<option value="html">HTML</option>
				<option value="css">CSS</option>
				<option value="json">JSON</option>
				<option value="bash">Bash</option>
			</select>
		</label>
		<button
			type="button"
			class:active={active.codeBlock}
			aria-label="Вставить блок кода"
			aria-pressed={active.codeBlock}
			onclick={() => editor?.chain().focus().toggleCodeBlock({ language: codeLanguage }).run()}
			>Код</button
		>
		<button
			type="button"
			aria-label="Вставить таблицу 3 на 3"
			onclick={() =>
				editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
			>Таблица</button
		>
	</div>
	<div class="image-controls">
		<label>
			URL изображения
			<input
				type="url"
				bind:value={imageUrl}
				placeholder="https://example.com/image.jpg"
				onkeydown={(event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						insertImage();
					}
				}}
			/>
		</label>
		<label>
			Описание
			<input type="text" bind:value={imageAlt} placeholder="Что изображено" />
		</label>
		<button type="button" onclick={insertImage}>Вставить изображение</button>
	</div>
	{#if imageError}
		<p class="image-error" role="alert">{imageError}</p>
	{/if}
	<div class="editor-surface" bind:this={editorElement}></div>
	<input type="hidden" name="content" value={content} />
</div>

<style>
	.rich-editor {
		overflow: hidden;
		border: 1px solid #ddd;
		border-radius: 6px;
	}

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		padding: 0.5rem;
		border-bottom: 1px solid #ddd;
		background: #f8f9fa;
	}

	.editor-toolbar button {
		min-width: 2.25rem;
		padding: 0.4rem 0.6rem;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		color: #343a40;
		cursor: pointer;
	}

	.editor-toolbar button:hover,
	.editor-toolbar button.active {
		border-color: #ced4da;
		background: white;
	}

	.language-picker,
	.image-controls label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #495057;
		font-size: 0.85rem;
	}

	.language-picker select,
	.image-controls input {
		min-width: 0;
		padding: 0.4rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		background: white;
		color: #343a40;
	}

	.image-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 0.5rem;
		padding: 0.6rem;
		border-bottom: 1px solid #ddd;
		background: #fbfcfd;
	}

	.image-controls label {
		flex: 1 1 12rem;
		flex-direction: column;
		align-items: stretch;
	}

	.image-controls button {
		padding: 0.45rem 0.65rem;
		border: 1px solid #ced4da;
		border-radius: 4px;
		background: white;
		color: #343a40;
		cursor: pointer;
	}

	.image-error {
		margin: 0;
		padding: 0.5rem 0.75rem;
		color: #b42318;
		font-size: 0.9rem;
	}

	.editor-surface {
		min-height: 20rem;
		padding: 0.75rem;
	}

	.editor-surface :global(.tiptap) {
		min-height: 18rem;
		outline: none;
	}

	.editor-surface :global(.tiptap > :first-child) {
		margin-top: 0;
	}

	.editor-surface :global(.tiptap ul),
	.editor-surface :global(.tiptap ol) {
		padding-left: 1.5rem;
	}

	.editor-surface :global(.tiptap img) {
		max-width: 100%;
		height: auto;
	}

	.editor-surface :global(.tiptap table) {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.editor-surface :global(.tiptap th),
	.editor-surface :global(.tiptap td) {
		position: relative;
		min-width: 1em;
		padding: 0.4rem;
		border: 1px solid #adb5bd;
		vertical-align: top;
	}

	.editor-surface :global(.tiptap th) {
		background: #f1f3f5;
		font-weight: 600;
	}

	.editor-surface :global(.tiptap .selectedCell::after) {
		position: absolute;
		inset: 0;
		z-index: 2;
		background: rgba(76, 151, 255, 0.15);
		content: '';
		pointer-events: none;
	}

	.editor-surface :global(.tiptap pre) {
		overflow-x: auto;
		padding: 1rem;
		border-radius: 6px;
		background: #1e293b;
		color: #e2e8f0;
	}

	.editor-surface :global(.tiptap pre .hljs-keyword),
	.editor-surface :global(.tiptap pre .hljs-selector-tag) {
		color: #c084fc;
	}

	.editor-surface :global(.tiptap pre .hljs-string),
	.editor-surface :global(.tiptap pre .hljs-attr) {
		color: #86efac;
	}

	.editor-surface :global(.tiptap pre .hljs-number),
	.editor-surface :global(.tiptap pre .hljs-literal) {
		color: #fcd34d;
	}

	.editor-surface :global(.tiptap pre .hljs-comment) {
		color: #94a3b8;
	}
</style>
