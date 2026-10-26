<script lang="ts">
	import { onMount } from 'svelte';

	type CategoryId = 'fruits' | 'vegetables' | 'animals_home' | 'animals_wild';

	interface Item {
		id: string;
		emoji: string;
		name: string;
		category: CategoryId;
		isSorted: boolean;
	}

	interface Category {
		id: CategoryId;
		name: string;
		emoji: string;
		color: string;
	}

	interface Level {
		id: string;
		name: string;
		categories: Category[];
		items: Omit<Item, 'isSorted'>[];
	}

	const levels: Level[] = [
		{
			id: 'lvl1',
			name: 'Фрукты и Овощи',
			categories: [
				{ id: 'fruits', name: 'Фрукты', emoji: '🍎', color: '#fed7d7' },
				{ id: 'vegetables', name: 'Овощи', emoji: '🥕', color: '#feebc8' }
			],
			items: [
				{ id: 'i1', emoji: '🍎', name: 'Яблоко', category: 'fruits' },
				{ id: 'i2', emoji: '🥕', name: 'Морковь', category: 'vegetables' },
				{ id: 'i3', emoji: '🍌', name: 'Банан', category: 'fruits' },
				{ id: 'i4', emoji: '🥦', name: 'Брокколи', category: 'vegetables' },
				{ id: 'i5', emoji: '🍇', name: 'Виноград', category: 'fruits' },
				{ id: 'i6', emoji: '🌽', name: 'Кукуруза', category: 'vegetables' }
			]
		},
		{
			id: 'lvl2',
			name: 'Домашние и Дикие',
			categories: [
				{ id: 'animals_home', name: 'Домашние', emoji: '🏠', color: '#c6f6d5' },
				{ id: 'animals_wild', name: 'Дикие', emoji: '🌲', color: '#e9d8fd' }
			],
			items: [
				{ id: 'i7', emoji: '🐶', name: 'Собака', category: 'animals_home' },
				{ id: 'i8', emoji: '🦊', name: 'Лиса', category: 'animals_wild' },
				{ id: 'i9', emoji: '🐱', name: 'Кошка', category: 'animals_home' },
				{ id: 'i10', emoji: '🐻', name: 'Медведь', category: 'animals_wild' },
				{ id: 'i11', emoji: '🐮', name: 'Корова', category: 'animals_home' },
				{ id: 'i12', emoji: '🦉', name: 'Сова', category: 'animals_wild' }
			]
		}
	];

	let currentLevelIndex = $state(0);
	let currentLevel = $derived(levels[currentLevelIndex]);
	let items = $state<Item[]>([]);

	let isDragging = $state(false);
	let draggedItemId = $state<string | null>(null);
	let dragStartX = $state(0);
	let dragStartY = $state(0);
	let currentX = $state(0);
	let currentY = $state(0);

	let isFinished = $state(false);
	let mismatch = $state<{ item: string; category: string } | null>(null);

	function initLevel(levelIdx: number) {
		currentLevelIndex = levelIdx;
		const level = levels[levelIdx];

		const shuffled = [...level.items].sort(() => Math.random() - 0.5);

		items = shuffled.map((item) => ({
			...item,
			isSorted: false
		}));

		isDragging = false;
		draggedItemId = null;
		isFinished = false;
		mismatch = null;
	}

	function handlePointerDown(event: PointerEvent, item: Item) {
		if (item.isSorted) return;

		event.preventDefault();
		event.stopPropagation();

		isDragging = true;
		draggedItemId = item.id;
		dragStartX = event.clientX;
		dragStartY = event.clientY;
		currentX = 0;
		currentY = 0;

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);

		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging) return;
		event.preventDefault();

		currentX = event.clientX - dragStartX;
		currentY = event.clientY - dragStartY;
	}

	function handlePointerUp(event: PointerEvent) {
		if (!isDragging || !draggedItemId) return;

		const item = items.find((i) => i.id === draggedItemId);

		if (item) {
			// Resolve the element actually underneath the pointer. This also works
			// when the layout changes while dragging or on narrow screens.
			const zone = document
				.elementsFromPoint(event.clientX, event.clientY)
				.map((element) => element.closest<HTMLElement>('[data-category]'))
				.find((element): element is HTMLElement => element !== null);
			const categoryId = zone?.dataset.category as CategoryId | undefined;
			const matchedCategory = currentLevel.categories.find((cat) => cat.id === categoryId);

			if (matchedCategory && matchedCategory.id === item.category) {
				// Reassign the array so Svelte invalidates the conditional block
				// that removes the item from the pool after a successful drop.
				items = items.map((currentItem) =>
					currentItem.id === item.id ? { ...currentItem, isSorted: true } : currentItem
				);

				if (items.every((i) => i.isSorted)) {
					setTimeout(() => {
						isFinished = true;
					}, 500);
				}
			} else if (matchedCategory) {
				mismatch = {
					item: item.name,
					category: matchedCategory.name.toLowerCase()
				};
			}
		}

		cleanupDrag();
	}

	function cleanupDrag() {
		isDragging = false;
		draggedItemId = null;
		currentX = 0;
		currentY = 0;

		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
		window.removeEventListener('pointercancel', handlePointerUp);
	}

	function closeMismatch() {
		mismatch = null;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') closeMismatch();
	}

	onMount(() => {
		initLevel(0);
		return () => cleanupDrag();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>Сортировка — Развивающая игра</title>
	<meta
		name="description"
		content="Перетаскивай предметы в правильные корзины. Развивает логику и внимание."
	/>
</svelte:head>

<div class="sorting-game">
	<header class="game-header">
		<h1>🧺 Сортировка</h1>
		<p class="subtitle">Перетащи предметы в правильные корзины!</p>
	</header>

	<section class="level-selector">
		{#each levels as level, idx}
			<button
				class="level-btn"
				class:active={currentLevelIndex === idx}
				onclick={() => initLevel(idx)}
			>
				{level.name}
			</button>
		{/each}
	</section>

	<main class="game-area">
		<section class="drop-zones">
			{#each currentLevel.categories as cat}
				<div class="drop-zone" data-category={cat.id} style="background-color: {cat.color};">
					<span class="zone-emoji">{cat.emoji}</span>
					<span class="zone-name">{cat.name}</span>

					<div class="sorted-items">
						{#each items.filter((i) => i.category === cat.id && i.isSorted) as sortedItem (sortedItem.id)}
							<span class="sorted-emoji">{sortedItem.emoji}</span>
						{/each}
					</div>
				</div>
			{/each}
		</section>

		<section class="items-pool">
			{#each items as item (item.id)}
				{#if !item.isSorted}
					<div
						class="draggable-item"
						class:is-dragging={isDragging && draggedItemId === item.id}
						style={isDragging && draggedItemId === item.id
							? `transform: translate3d(${currentX}px, ${currentY}px, 0) scale(1.1); z-index: 1000;`
							: ''}
						onpointerdown={(e) => handlePointerDown(e, item)}
						role="button"
						tabindex="0"
						aria-label={`Перетащи ${item.name}`}
					>
						<span class="item-emoji">{item.emoji}</span>
						<span class="item-name">{item.name}</span>
					</div>
				{/if}
			{/each}
		</section>
	</main>

	{#if mismatch}
		<div class="feedback-overlay">
			<div class="feedback-card" role="dialog" aria-modal="true" aria-labelledby="mismatch-title">
				<div class="feedback-icon" aria-hidden="true">🤔</div>
				<h2 id="mismatch-title">{mismatch.item} не {mismatch.category}</h2>
				<p>Попробуй другую категорию.</p>
				<button class="btn-primary" type="button" onclick={closeMismatch}>Понятно</button>
			</div>
		</div>
	{/if}

	{#if isFinished}
		<div class="victory-overlay">
			<div class="victory-card">
				<h2>🎉 Отлично!</h2>
				<p>Ты правильно рассортировал все предметы!</p>
				<div class="victory-actions">
					{#if currentLevelIndex < levels.length - 1}
						<button class="btn-primary" onclick={() => initLevel(currentLevelIndex + 1)}>
							Следующий уровень ➡️
						</button>
					{/if}
					<button class="btn-secondary" onclick={() => initLevel(currentLevelIndex)}>
						🔄 Играть снова
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.sorting-game {
		max-width: 900px;
		margin: 0 auto;
		padding: 1rem;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.game-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.game-header h1 {
		font-size: 2rem;
		color: #2d3748;
		margin-bottom: 0.25rem;
	}

	.subtitle {
		color: #718096;
		font-size: 1.1rem;
	}

	.level-selector {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
	}

	.level-btn {
		padding: 0.5rem 1.25rem;
		border: 2px solid #e2e8f0;
		border-radius: 20px;
		background: white;
		font-size: 1rem;
		font-weight: 600;
		color: #4a5568;
		cursor: pointer;
		transition: all 0.2s;
	}

	.level-btn:hover {
		border-color: #4299e1;
		color: #4299e1;
	}

	.level-btn.active {
		background: #4299e1;
		color: white;
		border-color: #4299e1;
	}

	.game-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.drop-zones {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.drop-zone {
		width: 200px;
		min-height: 180px;
		border-radius: 16px;
		border: 3px dashed rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		transition:
			transform 0.2s,
			border-color 0.2s;
	}

	.zone-emoji {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.zone-name {
		font-size: 1.2rem;
		font-weight: 700;
		color: #2d3748;
		margin-bottom: 1rem;
	}

	.sorted-items {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
	}

	.sorted-emoji {
		font-size: 1.5rem;
		animation: popIn 0.3s ease-out;
	}

	@keyframes popIn {
		0% {
			transform: scale(0);
		}
		80% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}

	.items-pool {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 1.5rem;
		background: #f7fafc;
		border-radius: 16px;
		min-height: 120px;
	}

	.draggable-item {
		width: 90px;
		height: 110px;
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: grab;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
	}

	.draggable-item:active {
		cursor: grabbing;
	}

	.draggable-item.is-dragging {
		box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
		pointer-events: none;
		transition: none;
		will-change: transform;
	}

	.item-emoji {
		font-size: 2.5rem;
		margin-bottom: 0.25rem;
		pointer-events: none;
	}

	.item-name {
		font-size: 0.85rem;
		color: #4a5568;
		font-weight: 600;
		text-align: center;
		pointer-events: none;
	}

	.feedback-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		z-index: 2000;
		animation: fadeIn 0.2s ease-out;
	}

	.feedback-card {
		width: min(400px, 100%);
		padding: 2rem;
		border-radius: 20px;
		background: white;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		text-align: center;
		animation: slideUp 0.25s ease-out;
	}

	.feedback-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
	}

	.feedback-card h2 {
		margin: 0 0 0.75rem;
		color: #2d3748;
		font-size: 1.6rem;
	}

	.feedback-card p {
		margin: 0 0 1.5rem;
		color: #718096;
	}

	.victory-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fadeIn 0.3s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.victory-card {
		background: white;
		padding: 2.5rem;
		border-radius: 20px;
		text-align: center;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.4s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(50px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.victory-card h2 {
		font-size: 2rem;
		color: #48bb78;
		margin-bottom: 1rem;
	}

	.victory-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn-primary,
	.btn-secondary {
		padding: 0.75rem 1.5rem;
		border-radius: 10px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: transform 0.1s;
	}

	.btn-primary {
		background: #48bb78;
		color: white;
	}

	.btn-primary:hover {
		background: #38a169;
	}

	.btn-secondary {
		background: #edf2f7;
		color: #4a5568;
	}

	.btn-secondary:hover {
		background: #e2e8f0;
	}

	.btn-primary:active,
	.btn-secondary:active {
		transform: scale(0.95);
	}

	@media (max-width: 600px) {
		.drop-zone {
			width: 140px;
			min-height: 140px;
		}
		.zone-emoji {
			font-size: 2rem;
		}
		.zone-name {
			font-size: 1rem;
		}

		.draggable-item {
			width: 75px;
			height: 95px;
		}
		.item-emoji {
			font-size: 2rem;
		}
		.item-name {
			font-size: 0.75rem;
		}
	}
</style>
