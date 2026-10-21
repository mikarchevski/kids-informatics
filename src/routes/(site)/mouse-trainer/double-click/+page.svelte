<script lang="ts">
	import { onDestroy } from 'svelte';
	import Seo from '#lib/components/Seo.svelte';
	import './page.css';

	type Chest = {
		id: number;
		x: number;
		y: number;
		reward: string;
	};

	const chests: Chest[] = [
		{ id: 1, x: 13, y: 20, reward: '💎' },
		{ id: 2, x: 38, y: 30, reward: '👑' },
		{ id: 3, x: 63, y: 24, reward: '🏆' },
		{ id: 4, x: 88, y: 38, reward: '⭐' },
		{ id: 5, x: 25, y: 70, reward: '🎁' },
		{ id: 6, x: 50, y: 76, reward: '🔮' },
		{ id: 7, x: 76, y: 66, reward: '💰' }
	];

	let openedChestIds = $state<number[]>([]);
	let hintedChestId = $state<number | null>(null);
	let isComplete = $state(false);
	let hintTimeout: ReturnType<typeof setTimeout> | undefined;

	const progress = $derived((openedChestIds.length / chests.length) * 100);

	function showDoubleClickHint(chestId: number) {
		if (openedChestIds.includes(chestId)) return;

		if (hintTimeout) clearTimeout(hintTimeout);
		hintedChestId = chestId;
		hintTimeout = setTimeout(() => {
			hintedChestId = null;
			hintTimeout = undefined;
		}, 1400);
	}

	function openChest(chestId: number, event: MouseEvent) {
		event.preventDefault();
		if (openedChestIds.includes(chestId)) return;

		if (hintTimeout) clearTimeout(hintTimeout);
		hintTimeout = undefined;
		hintedChestId = null;
		openedChestIds = [...openedChestIds, chestId];

		if (openedChestIds.length === chests.length) isComplete = true;
	}

	function resetGame() {
		if (hintTimeout) clearTimeout(hintTimeout);
		hintTimeout = undefined;
		openedChestIds = [];
		hintedChestId = null;
		isComplete = false;
	}

	onDestroy(() => {
		if (hintTimeout) clearTimeout(hintTimeout);
	});
</script>

<Seo
	title="Игра «Сундуки»: учимся двойному клику мыши"
	description="Открывай сундуки двойным нажатием левой кнопки мыши и осваивай двойной клик в игровой форме."
	path="/mouse-trainer/double-click"
/>

<div class="game-page">
	<div class="double-click-card">
		<header class="double-click-heading">
			<h1><span aria-hidden="true">📦</span> Открой все сундуки двойным кликом!</h1>
			<p class="double-click-score" aria-live="polite">{openedChestIds.length} / {chests.length}</p>
		</header>

		<div
			class="double-click-progress"
			role="progressbar"
			aria-label="Открытые сундуки"
			aria-valuemin={0}
			aria-valuemax={chests.length}
			aria-valuenow={openedChestIds.length}
		>
			<div class="double-click-progress-fill" style={`width: ${progress}%`}></div>
		</div>

		<section class="double-click-board" aria-label="Сундуки с сокровищами">
			{#each chests as chest (chest.id)}
				{@const isOpened = openedChestIds.includes(chest.id)}
				<div
					class="double-click-chest-position"
					style={`--chest-x: ${chest.x}%; --chest-y: ${chest.y}%`}
				>
					{#if isOpened}
						<div class="double-click-reward" aria-label={`Найдено сокровище: ${chest.reward}`}>
							<span class="double-click-reward-icon" aria-hidden="true">{chest.reward}</span>
							<span class="double-click-sparkles" aria-hidden="true">✨ ✨ ✨</span>
						</div>
					{:else}
						<div class="double-click-chest-wrap">
							<button
								class="double-click-chest"
								onclick={() => showDoubleClickHint(chest.id)}
								ondblclick={(event) => openChest(chest.id, event)}
								oncontextmenu={(event) => event.preventDefault()}
								aria-label={`Сундук ${chest.id}. Нажми дважды левой кнопкой, чтобы открыть`}
								type="button"
							>
								📦
							</button>
							{#if hintedChestId === chest.id}
								<span class="double-click-hint" role="status">Нажми 2 раза</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}

			{#if isComplete}
				<div class="double-click-win-overlay">
					<div
						class="double-click-win-content"
						role="dialog"
						aria-modal="true"
						aria-labelledby="double-click-result-title"
						tabindex="-1"
					>
						<span class="double-click-win-icon" aria-hidden="true">🎉</span>
						<h2 id="double-click-result-title">Ура! Все сундуки открыты!</h2>
						<p>Ты нашёл все сокровища и отлично освоил двойной клик!</p>
						<button class="double-click-repeat" onclick={resetGame} type="button">
							<span aria-hidden="true">🔄</span>
							Сыграть ещё раз
						</button>
					</div>
				</div>
			{/if}
		</section>

		<p class="double-click-instruction">
			<span aria-hidden="true">ⓘ</span>
			<strong>Двойной клик</strong> = два быстрых нажатия левой кнопки
		</p>

		<div class="double-click-back-section">
			<a class="double-click-back-button" href="/mouse-trainer">← Назад к играм</a>
		</div>
	</div>
</div>
