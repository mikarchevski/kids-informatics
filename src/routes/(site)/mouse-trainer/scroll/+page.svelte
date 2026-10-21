<script lang="ts">
	import './page.css';

	type Treasure = {
		id: number;
		meters: number;
		x: number;
		icon: string;
		name: string;
	};

	const treasures: Treasure[] = [
		{ id: 1, meters: 1, x: 34, icon: '💎', name: 'Алмаз' },
		{ id: 2, meters: 4.2, x: 67, icon: '🪙', name: 'Монетка' },
		{ id: 3, meters: 7.4, x: 43, icon: '🐚', name: 'Ракушка' },
		{ id: 4, meters: 10.6, x: 76, icon: '🏺', name: 'Амфора' },
		{ id: 5, meters: 13.8, x: 29, icon: '🌟', name: 'Звезда' },
		{ id: 6, meters: 17, x: 61, icon: '🧿', name: 'Синий глаз' },
		{ id: 7, meters: 20.2, x: 39, icon: '📿', name: 'Ожерелье' },
		{ id: 8, meters: 23.5, x: 72, icon: '💰', name: 'Мешочек золота' }
	];

	const depthMarkers = [0, 5, 10, 15, 20, 25];
	const totalDepth = 25;
	const pixelsPerMeter = 100;
	const oceanHeight = 2900;

	let collectedTreasureIds = $state<number[]>([]);
	let currentDepth = $state(0);
	let scrollTop = $state(0);
	let isComplete = $state(false);
	let oceanElement: HTMLDivElement;

	const progress = $derived((collectedTreasureIds.length / treasures.length) * 100);

	function updateDepth() {
		if (!oceanElement) return;
		const maxScroll = oceanElement.scrollHeight - oceanElement.clientHeight;
		scrollTop = oceanElement.scrollTop;
		currentDepth =
			maxScroll > 0 ? Math.round((oceanElement.scrollTop / maxScroll) * totalDepth) : 0;
	}

	function collectTreasure(treasureId: number, event: MouseEvent) {
		if (event.button !== 0 || collectedTreasureIds.includes(treasureId)) return;

		collectedTreasureIds = [...collectedTreasureIds, treasureId];
		if (collectedTreasureIds.length === treasures.length) isComplete = true;
	}

	function resetGame() {
		collectedTreasureIds = [];
		currentDepth = 0;
		scrollTop = 0;
		isComplete = false;
		if (oceanElement) oceanElement.scrollTop = 0;
	}
</script>

<svelte:head>
	<title>Прокрутка — Тренажёр мышки</title>
	<meta
		name="description"
		content="Прокручивай морское дно и собирай сокровища на глубине до 25 метров."
	/>
</svelte:head>

<div class="game-page">
	<div class="scroll-game-card">
		<header class="scroll-game-heading">
			<h1><span aria-hidden="true">🏴‍☠️</span> Найди все сокровища!</h1>
			<p class="scroll-game-score" aria-live="polite">
				{collectedTreasureIds.length} / {treasures.length}
			</p>
		</header>

		<div
			class="scroll-game-progress"
			role="progressbar"
			aria-label="Собранные сокровища"
			aria-valuemin={0}
			aria-valuemax={treasures.length}
			aria-valuenow={collectedTreasureIds.length}
		>
			<div class="scroll-game-progress-fill" style={`width: ${progress}%`}></div>
		</div>

		<section class="scroll-ocean-shell" aria-label="Подводное игровое поле">
			<aside class="depth-ruler" aria-label="Глубина">
				<div
					class="depth-ruler-content"
					style={`height: ${oceanHeight}px; transform: translateY(-${scrollTop}px)`}
				>
					{#each depthMarkers as depth (depth)}
						<span
							class="depth-marker"
							class:depth-marker-active={currentDepth >= depth}
							style={`top: ${depth * pixelsPerMeter}px`}
						>
							{depth} м
						</span>
					{/each}
				</div>
			</aside>

			<div
				class="scroll-ocean"
				bind:this={oceanElement}
				onscroll={updateDepth}
				role="region"
				aria-label="Прокручиваемое море"
			>
				<div class="ocean-content" style={`height: ${oceanHeight}px`}>
					<div class="ocean-bubbles" aria-hidden="true">·　°　˚　·　°　˚　·</div>
					{#each treasures as treasure (treasure.id)}
						{@const isCollected = collectedTreasureIds.includes(treasure.id)}
						<button
							class="ocean-treasure"
							class:ocean-treasure-collected={isCollected}
							style={`--treasure-x: ${treasure.x}%; --treasure-y: ${treasure.meters * pixelsPerMeter}px`}
							onclick={(event) => collectTreasure(treasure.id, event)}
							oncontextmenu={(event) => event.preventDefault()}
							aria-label={isCollected ? `${treasure.name}, собрано` : `Собрать: ${treasure.name}`}
							aria-pressed={isCollected}
							type="button"
							disabled={isCollected}
						>
							<span aria-hidden="true">{treasure.icon}</span>
						</button>
					{/each}

					<div class="ocean-seabed" role="group" aria-label="Морское дно">
						<div class="seabed-decor seabed-coral" aria-hidden="true">🪸</div>
						<div class="seabed-decor seabed-shell" aria-hidden="true">🐚</div>
						<div class="seabed-decor seabed-plant" aria-hidden="true">🌿</div>
						<div class="seabed-decor seabed-starfish" aria-hidden="true">⭐</div>
						<h2>Морское дно</h2>
						<p aria-hidden="true">🪨　🫧　🐠　🪸　🪨　🫧</p>
					</div>
				</div>
			</div>
			{#if isComplete}
				<div class="scroll-win-overlay">
					<div
						class="scroll-win-content"
						role="dialog"
						aria-modal="true"
						aria-labelledby="scroll-result-title"
						tabindex="-1"
					>
						<span class="scroll-win-icon" aria-hidden="true">🎉</span>
						<h2 id="scroll-result-title">Ура! Все сокровища собраны!</h2>
						<p>Ты нашёл все сокровища на морском дне. Отличная работа!</p>
						<button class="scroll-win-repeat" onclick={resetGame} type="button">
							<span aria-hidden="true">🔄</span>
							Повторить
						</button>
					</div>
				</div>
			{/if}
		</section>

		<p class="scroll-game-instruction">
			<span aria-hidden="true">ⓘ</span> Крути <strong>колёсико мыши</strong>, чтобы опуститься на
			дно и собери все сокровища
		</p>

		<div class="scroll-game-back-section">
			<a class="scroll-game-back-button" href="/mouse-trainer">← Назад к играм</a>
		</div>
	</div>
</div>
