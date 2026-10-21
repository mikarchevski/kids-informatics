<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Seo from '#lib/components/Seo.svelte';
	import './page.css';

	type Target = {
		id: number;
		level: 1 | 2 | 3;
	};
	type Impact = { id: number; x: number; y: number };
	type Position = { x: number; y: number };

	const targets: Target[] = [
		{ id: 1, level: 1 },
		{ id: 2, level: 1 },
		{ id: 3, level: 1 },
		{ id: 4, level: 1 },
		{ id: 5, level: 1 },
		{ id: 6, level: 2 },
		{ id: 7, level: 2 },
		{ id: 8, level: 2 },
		{ id: 9, level: 2 },
		{ id: 10, level: 2 },
		{ id: 11, level: 3 },
		{ id: 12, level: 3 },
		{ id: 13, level: 3 },
		{ id: 14, level: 3 },
		{ id: 15, level: 3 }
	];

	const levelDetails = {
		1: { title: 'Легко — Большие мишени', icon: '🌟' },
		2: { title: 'Средне — Средние мишени', icon: '⭐' },
		3: { title: 'Сложно — Маленькие мишени', icon: '🏆' }
	};
	const targetSizes = { 1: 104, 2: 76, 3: 54 };
	const totalTargets = targets.length;

	let positionsByTarget = $state<Record<number, Position>>({});
	let boardElement: HTMLElement;
	let hitTargetIds = $state<number[]>([]);
	let destroyedTargetIds = $state<number[]>([]);
	let impacts = $state<Impact[]>([]);
	let isComplete = $state(false);
	let destructionTimers: ReturnType<typeof setTimeout>[] = [];
	let impactTimers: ReturnType<typeof setTimeout>[] = [];

	const progress = $derived((hitTargetIds.length / totalTargets) * 100);
	const currentLevel = $derived(
		Math.min(Math.floor(destroyedTargetIds.length / 5) + 1, 3) as 1 | 2 | 3
	);
	const activeTargets = $derived(
		targets.filter(
			(target) =>
				target.level === currentLevel &&
				!destroyedTargetIds.includes(target.id) &&
				positionsByTarget[target.id] !== undefined
		)
	);

	function randomizeTargetPositions() {
		if (!boardElement) return;

		const boardWidth = boardElement.clientWidth;
		const boardHeight = boardElement.clientHeight;
		const positions: Record<number, Position> = {};

		for (const level of [1, 2, 3] as const) {
			const levelTargets = targets.filter((target) => target.level === level);
			const radius = targetSizes[level] / 2;
			const placed: Array<{ x: number; y: number }> = [];

			levelTargets.forEach((target) => {
				let candidate = { x: boardWidth / 2, y: boardHeight / 2 };

				for (let attempt = 0; attempt < 100; attempt++) {
					candidate = {
						x: radius + 14 + Math.random() * (boardWidth - radius * 2 - 28),
						y:
							Math.max(100, radius + 14) +
							Math.random() * (boardHeight - Math.max(100, radius + 14) - radius - 14)
					};
					const clearance = placed.reduce((minimum, other) => {
						const distance = Math.hypot(candidate.x - other.x, candidate.y - other.y);
						return Math.min(minimum, distance);
					}, Infinity);
					const overlapsLevelLabel =
						Math.abs(candidate.x - boardWidth / 2) < Math.min(170, boardWidth * 0.28) &&
						candidate.y < 86 + radius;

					if (clearance >= targetSizes[level] + 18 && !overlapsLevelLabel) break;
				}

				placed.push(candidate);
				positions[target.id] = {
					x: (candidate.x / boardWidth) * 100,
					y: (candidate.y / boardHeight) * 100
				};
			});
		}

		positionsByTarget = positions;
	}

	function hitTarget(target: Target) {
		if (hitTargetIds.includes(target.id) || isComplete) return;

		hitTargetIds = [...hitTargetIds, target.id];
		const position = positionsByTarget[target.id];
		impacts = [...impacts, { id: target.id, x: position.x, y: position.y }];

		impactTimers.push(
			setTimeout(() => {
				impacts = impacts.filter((impact) => impact.id !== target.id);
			}, 520)
		);
		destructionTimers.push(
			setTimeout(() => {
				destroyedTargetIds = [...destroyedTargetIds, target.id];
				if (destroyedTargetIds.length === totalTargets) isComplete = true;
			}, 520)
		);
	}

	function resetGame() {
		for (const timer of [...destructionTimers, ...impactTimers]) clearTimeout(timer);
		destructionTimers = [];
		impactTimers = [];
		hitTargetIds = [];
		destroyedTargetIds = [];
		impacts = [];
		isComplete = false;
		randomizeTargetPositions();
	}

	onMount(randomizeTargetPositions);

	onDestroy(() => {
		for (const timer of [...destructionTimers, ...impactTimers]) clearTimeout(timer);
	});
</script>

<Seo
	title="Тренировка точности мыши для детей — Kids Informatics"
	description="Попадай курсором в мишени, которые становятся всё меньше, и тренируй точность управления мышью."
	path="/mouse-trainer/aim"
	schema={{
		'@type': 'WebApplication',
		name: 'Тренировка точности мыши',
		applicationCategory: 'GameApplication',
		educationalUse: 'Тренировка точности управления компьютерной мышью',
		inLanguage: 'ru-RU',
		isPartOf: { '@id': 'https://kids-informatics.mk5d.ru/#website' }
	}}
/>

<div class="game-page">
	<div class="aim-game-card">
		<header class="aim-game-heading">
			<h1><span aria-hidden="true">🎯</span> Попади в цель!</h1>
			<div class="aim-game-status">
				<p class="aim-game-score" aria-live="polite">{hitTargetIds.length} / {totalTargets}</p>
				<span class="aim-game-level">Уровень {currentLevel}</span>
			</div>
		</header>

		<div
			class="aim-game-progress"
			role="progressbar"
			aria-label="Попадания по мишеням"
			aria-valuemin={0}
			aria-valuemax={totalTargets}
			aria-valuenow={hitTargetIds.length}
		>
			<div class="aim-game-progress-fill" style={`width: ${progress}%`}></div>
		</div>

		<section class="aim-game-board" bind:this={boardElement} aria-label="Игровое поле с мишенями">
			<div class="aim-level-label" aria-live="polite">
				<span aria-hidden="true">{levelDetails[currentLevel].icon}</span>
				{levelDetails[currentLevel].title}
			</div>

			{#each activeTargets as target (target.id)}
				<button
					class="aim-target"
					class:aim-target-large={target.level === 1}
					class:aim-target-medium={target.level === 2}
					class:aim-target-small={target.level === 3}
					class:aim-target-destroying={hitTargetIds.includes(target.id)}
					style={`--target-x: ${positionsByTarget[target.id].x}%; --target-y: ${positionsByTarget[target.id].y}%`}
					onclick={() => hitTarget(target)}
					oncontextmenu={(event) => event.preventDefault()}
					aria-label={`Мишень ${target.id}, уровень ${target.level}`}
					type="button"
					disabled={hitTargetIds.includes(target.id)}
				>
					<span class="aim-target-ring aim-target-ring-outer"></span>
					<span class="aim-target-ring aim-target-ring-middle"></span>
					<span class="aim-target-ring aim-target-ring-inner"></span>
					<span class="aim-target-center"></span>
				</button>
			{/each}

			{#each impacts as impact (impact.id)}
				<span
					class="aim-shot-impact"
					style={`--impact-x: ${impact.x}%; --impact-y: ${impact.y}%`}
					aria-hidden="true"
				></span>
			{/each}

			{#if isComplete}
				<div class="aim-win-overlay">
					<div
						class="aim-win-content"
						role="dialog"
						aria-modal="true"
						aria-labelledby="aim-result-title"
						tabindex="-1"
					>
						<span class="aim-win-icon" aria-hidden="true">🎉</span>
						<h2 id="aim-result-title">Ура! Все мишени сбиты!</h2>
						<p>Ты попал во все 15 целей и отлично потренировал точность!</p>
						<button class="aim-win-repeat" onclick={resetGame} type="button">
							<span aria-hidden="true">🔄</span>
							Сыграть ещё раз
						</button>
					</div>
				</div>
			{/if}
		</section>

		<p class="aim-game-instruction">
			<span aria-hidden="true">ⓘ</span>
			Кликай точно в <strong>центр мишени</strong>. С каждым уровнем мишени становятся меньше!
		</p>

		<div class="aim-game-back-section">
			<a class="aim-game-back-button" href="/mouse-trainer">← Назад к играм</a>
		</div>
	</div>
</div>
