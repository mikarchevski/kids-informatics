<script lang="ts">
	type Difficulty = 'easy' | 'medium' | 'hard';
	type PatternType = 'Чередование' | 'Цикл ABC' | 'Повторение' | 'Прогрессия' | 'Симметрия';

	interface Level {
		id: string;
		difficulty: Difficulty;
		patternType: PatternType;
		sequence: string[];
		answer: string;
		options: string[];
		hint: string;
	}

	interface Progress {
		currentLevel: number;
		completedLevels: number;
		totalErrors: number;
		hintsUsed: number;
		bestScore: number | null;
		lastPlayed: string;
		unlockedDifficulty: Difficulty;
	}

	const levels: Level[] = [
		{
			id: 'easy-1',
			difficulty: 'easy',
			patternType: 'Чередование',
			sequence: ['🔴', '🔵', '🔴', '🔵'],
			answer: '🔴',
			options: ['🔴', '🟡', '🟢'],
			hint: 'Посмотри на цвета: они идут по очереди — красный, синий.'
		},
		{
			id: 'easy-2',
			difficulty: 'easy',
			patternType: 'Чередование',
			sequence: ['🐱', '🐶', '🐱'],
			answer: '🐶',
			options: ['🐭', '🐶', '🐰'],
			hint: 'Кошка и собака меняются местами.'
		},
		{
			id: 'easy-3',
			difficulty: 'easy',
			patternType: 'Чередование',
			sequence: ['⭐', '🟩', '⭐', '🟩'],
			answer: '⭐',
			options: ['🔶', '⭐', '❤️'],
			hint: 'Звёздочка повторяется через один элемент.'
		},
		{
			id: 'easy-4',
			difficulty: 'easy',
			patternType: 'Чередование',
			sequence: ['🍎', '🍌', '🍎'],
			answer: '🍌',
			options: ['🍇', '🍊', '🍌'],
			hint: 'Фрукты чередуются: яблоко, банан.'
		},
		{
			id: 'easy-5',
			difficulty: 'easy',
			patternType: 'Чередование',
			sequence: ['☀️', '🌙', '☀️', '🌙'],
			answer: '☀️',
			options: ['🌈', '☀️', '⭐'],
			hint: 'День и ночь повторяются по очереди.'
		},
		{
			id: 'medium-1',
			difficulty: 'medium',
			patternType: 'Цикл ABC',
			sequence: ['🍎', '🍇', '🍌', '🍎'],
			answer: '🍇',
			options: ['🍇', '🍉', '🍐'],
			hint: 'Повторяется круг из трёх фруктов.'
		},
		{
			id: 'medium-2',
			difficulty: 'medium',
			patternType: 'Повторение',
			sequence: ['🐶', '🐶', '🐱', '🐶', '🐶'],
			answer: '🐱',
			options: ['🐰', '🐱', '🐭'],
			hint: 'Две собачки, затем одна кошка — и снова.'
		},
		{
			id: 'medium-3',
			difficulty: 'medium',
			patternType: 'Повторение',
			sequence: ['🔴', '🔴', '🔵', '🔴', '🔴'],
			answer: '🔵',
			options: ['🟢', '🟡', '🔵'],
			hint: 'Два красных кружка сменяются одним синим.'
		},
		{
			id: 'medium-4',
			difficulty: 'medium',
			patternType: 'Цикл ABC',
			sequence: ['⭐', '🔶', '🟩', '⭐', '🔶'],
			answer: '🟩',
			options: ['🟩', '❤️', '🔵'],
			hint: 'Найди повторяющийся порядок из звезды, ромба и квадрата.'
		},
		{
			id: 'medium-5',
			difficulty: 'medium',
			patternType: 'Повторение',
			sequence: ['🌸', '🌸', '🌼', '🌸', '🌸'],
			answer: '🌼',
			options: ['🌻', '🌼', '🌹'],
			hint: 'Цветок 🌼 появляется после двух 🌸.'
		},
		{
			id: 'hard-1',
			difficulty: 'hard',
			patternType: 'Прогрессия',
			sequence: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'],
			answer: '5️⃣',
			options: ['5️⃣', '6️⃣', '4️⃣'],
			hint: 'Числа увеличиваются на один.'
		},
		{
			id: 'hard-2',
			difficulty: 'hard',
			patternType: 'Цикл ABC',
			sequence: ['🔴', '🟡', '🟢', '🔴', '🟡'],
			answer: '🟢',
			options: ['🔵', '🟢', '🔴'],
			hint: 'Это знакомый порядок цветов светофора.'
		},
		{
			id: 'hard-3',
			difficulty: 'hard',
			patternType: 'Симметрия',
			sequence: ['🌼', '🌸', '🌼', '🌸', '🌼'],
			answer: '🌸',
			options: ['🌺', '🌸', '🌻'],
			hint: 'Цветы отражают друг друга и чередуются.'
		},
		{
			id: 'hard-4',
			difficulty: 'hard',
			patternType: 'Прогрессия',
			sequence: ['🌑', '🌒', '🌓', '🌔'],
			answer: '🌕',
			options: ['🌕', '🌘', '☀️'],
			hint: 'Луна постепенно становится всё полнее.'
		},
		{
			id: 'hard-5',
			difficulty: 'hard',
			patternType: 'Симметрия',
			sequence: ['🔵', '🟢', '🟡', '🟢'],
			answer: '🔵',
			options: ['🔴', '🔵', '🟣'],
			hint: 'Последовательность отражается относительно жёлтого центра.'
		}
	];

	const difficultyLabels: Record<Difficulty, string> = {
		easy: 'Легко',
		medium: 'Средне',
		hard: 'Сложно'
	};
	const storageKey = 'logic-chains-progress';

	let currentLevelIndex = $state(0);
	let errors = $state(0);
	let hintsUsed = $state(0);
	let completedLevels = $state(0);
	let bestScore = $state<number | null>(null);
	let hintVisible = $state(false);
	let hintUsedOnLevel = $state(false);
	let isCorrect = $state(false);
	let isFinished = $state(false);
	let wrongOption = $state<string | null>(null);
	let selectedAnswer = $state<string | null>(null);

	let currentLevel = $derived(levels[currentLevelIndex]);
	let availableOptions = $derived(currentLevel.options);
	let difficulty = $derived(currentLevel.difficulty);

	function saveProgress() {
		if (typeof localStorage === 'undefined') return;
		const progress: Progress = {
			currentLevel: currentLevelIndex,
			completedLevels,
			totalErrors: errors,
			hintsUsed,
			bestScore,
			lastPlayed: new Date().toISOString(),
			unlockedDifficulty:
				currentLevelIndex >= 10 ? 'hard' : currentLevelIndex >= 5 ? 'medium' : 'easy'
		};
		localStorage.setItem(storageKey, JSON.stringify(progress));
	}

	function loadProgress() {
		if (typeof localStorage === 'undefined') return;
		try {
			const saved = JSON.parse(
				localStorage.getItem(storageKey) ?? 'null'
			) as Partial<Progress> | null;
			if (!saved) return;
			currentLevelIndex = Math.min(Math.max(saved.currentLevel ?? 0, 0), levels.length - 1);
			completedLevels = saved.completedLevels ?? 0;
			errors = saved.totalErrors ?? 0;
			hintsUsed = saved.hintsUsed ?? 0;
			bestScore = saved.bestScore ?? null;
		} catch {
			localStorage.removeItem(storageKey);
		}
	}

	function resetLevelState() {
		hintVisible = false;
		hintUsedOnLevel = false;
		isCorrect = false;
		wrongOption = null;
		selectedAnswer = null;
	}

	function chooseOption(option: string) {
		if (isCorrect || isFinished || wrongOption) return;
		if (option === currentLevel.answer) {
			selectedAnswer = option;
			isCorrect = true;
			completedLevels = Math.max(completedLevels, currentLevelIndex + 1);
			saveProgress();
		} else {
			wrongOption = option;
			errors++;
			saveProgress();
			setTimeout(() => {
				wrongOption = null;
			}, 450);
		}
	}

	function nextLevel() {
		if (!isCorrect) return;
		if (currentLevelIndex === levels.length - 1) {
			isFinished = true;
			bestScore = bestScore === null ? errors : Math.min(bestScore, errors);
			saveProgress();
			return;
		}
		currentLevelIndex++;
		resetLevelState();
		saveProgress();
	}

	function skipLevel() {
		errors++;
		if (currentLevelIndex === levels.length - 1) {
			isFinished = true;
		} else {
			currentLevelIndex++;
			resetLevelState();
		}
		saveProgress();
	}

	function showHint() {
		if (!hintUsedOnLevel) {
			hintsUsed++;
			hintUsedOnLevel = true;
			saveProgress();
		}
		hintVisible = true;
	}

	function restartGame() {
		currentLevelIndex = 0;
		errors = 0;
		hintsUsed = 0;
		completedLevels = 0;
		bestScore = null;
		isFinished = false;
		resetLevelState();
		saveProgress();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') hintVisible = false;
	}

	$effect(() => {
		loadProgress();
	});
</script>

<svelte:head>
	<title>Логические цепочки — Что дальше?</title>
	<meta name="description" content="Развивающая игра на поиск закономерностей для детей 4–8 лет." />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="logic-game">
	{#if isFinished}
		<section class="finish-card" aria-labelledby="finish-title">
			<div class="finish-icon" aria-hidden="true">🎉</div>
			<h1 id="finish-title">Отличная работа!</h1>
			<p>Ты прошёл все {levels.length} уровней.</p>
			<div class="result-stats">
				<span>Ошибок: <strong>{errors}</strong></span>
				<span>Подсказок: <strong>{hintsUsed}</strong></span>
			</div>
			<button class="primary-button" type="button" onclick={restartGame}>🔄 Начать заново</button>
		</section>
	{:else}
		<header class="game-heading">
			<div>
				<p class="eyebrow">Логические цепочки</p>
				<h1>Что будет дальше?</h1>
			</div>
			<div class="score" aria-live="polite">
				Уровень {currentLevelIndex + 1} из {levels.length}<br />Ошибок: {errors}
			</div>
		</header>

		<section class="level-info" aria-label="Информация об уровне">
			<span class="difficulty difficulty-{difficulty}">{difficultyLabels[difficulty]}</span>
			<span>{currentLevel.patternType}</span>
		</section>

		<main>
			{#if isCorrect}
				<div class="success-message" role="status">
					🎉 Правильно! {currentLevel.answer} подходит!
				</div>
			{/if}

			<section class:correct={isCorrect} class="sequence-card" aria-label="Цепочка элементов">
				{#each currentLevel.sequence as element, index}
					<span class="sequence-element" aria-label={`Элемент ${index + 1}: ${element}`}
						>{element}</span
					>
				{/each}
				<span
					class="sequence-gap"
					class:hinted={hintVisible && !selectedAnswer}
					class:filled={selectedAnswer !== null}
					aria-label={selectedAnswer
						? `Правильный элемент: ${selectedAnswer}`
						: hintVisible
							? `Подсказка: правильный элемент ${currentLevel.answer}`
							: 'Пропуск: выбери следующий элемент'}
				>
					{selectedAnswer ?? (hintVisible ? currentLevel.answer : '❓')}
				</span>
			</section>

			<h2>Выбери, что будет дальше:</h2>
			<section class="options" aria-label="Варианты ответа">
				{#each availableOptions as option}
					<button
						class="option"
						class:wrong={wrongOption === option}
						class:correct-option={isCorrect && option === currentLevel.answer}
						type="button"
						onclick={() => chooseOption(option)}
						aria-label={`Вариант ответа ${option}`}
					>
						<span aria-hidden="true">{option}</span>
					</button>
				{/each}
			</section>

			{#if hintVisible}
				<div class="hint" role="status">💡 {currentLevel.hint}</div>
			{/if}

			{#if isCorrect}
				<button class="next-button" type="button" onclick={nextLevel}>
					{currentLevelIndex === levels.length - 1 ? '🏆 Завершить' : 'Дальше ➡️'}
				</button>
			{/if}

			<div class="actions">
				<button class="secondary-button" type="button" onclick={showHint} disabled={hintVisible}
					>💡 Подсказка</button
				>
				<button class="secondary-button" type="button" onclick={restartGame}>🔄 Заново</button>
				<button class="secondary-button skip" type="button" onclick={skipLevel}
					>⏭️ Пропустить</button
				>
			</div>
		</main>
	{/if}
</div>

<style>
	:global(body) {
		background: #f7fafc;
	}
	.logic-game {
		max-width: 820px;
		margin: 0 auto;
		padding: 1rem 1.5rem 3rem;
		color: #2d3748;
	}
	.game-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		margin: 1rem 0 0.75rem;
	}
	.eyebrow {
		margin: 0 0 0.25rem;
		color: #4299e1;
		font-size: 0.95rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.8rem, 5vw, 2.8rem);
		color: #2d3748;
	}
	.score {
		color: #718096;
		font-size: 0.95rem;
		line-height: 1.7;
		text-align: right;
	}
	.level-info {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		margin-bottom: 1.5rem;
		color: #718096;
		font-size: 0.95rem;
	}
	.difficulty {
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		font-weight: 700;
	}
	.difficulty-easy {
		background: #c6f6d5;
		color: #276749;
	}
	.difficulty-medium {
		background: #feebc8;
		color: #975a16;
	}
	.difficulty-hard {
		background: #fed7d7;
		color: #9b2c2c;
	}
	.sequence-card {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: clamp(0.35rem, 2vw, 1rem);
		min-height: 150px;
		padding: 1.5rem;
		background: white;
		border-radius: 22px;
		box-shadow: 0 8px 24px rgb(45 55 72 / 10%);
		animation: appear 0.4s ease-out;
	}
	.sequence-card.correct {
		border: 4px solid #48bb78;
		animation: correctPulse 0.5s ease-out;
	}
	.sequence-element,
	.sequence-gap {
		display: flex;
		align-items: center;
		justify-content: center;
		width: clamp(58px, 11vw, 86px);
		height: clamp(58px, 11vw, 86px);
		padding: 0;
		border-radius: 16px;
		font-size: clamp(2.2rem, 7vw, 4rem);
		line-height: 1;
		text-align: center;
		font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
	}
	.sequence-element {
		background: #f7fafc;
	}
	.sequence-gap {
		background: #fefcbf;
		border: 3px dashed #d69e2e;
	}
	.sequence-gap.hinted {
		background: #c6f6d5;
		border-color: #48bb78;
		box-shadow: 0 0 0 6px rgb(72 187 120 / 16%);
		animation: correctPulse 0.5s ease-out;
	}
	.sequence-gap.filled {
		background: #c6f6d5;
		border: 3px solid #48bb78;
		animation: answerArrives 0.55s ease-out;
	}
	main h2 {
		margin: 2rem 0 1rem;
		text-align: center;
		font-size: 1.2rem;
	}
	.options {
		display: flex;
		justify-content: center;
		gap: 1rem;
		min-height: 112px;
	}
	.option {
		width: 100px;
		height: 100px;
		border: 2px solid #e2e8f0;
		border-radius: 18px;
		background: white;
		box-shadow: 0 5px 12px rgb(45 55 72 / 10%);
		cursor: pointer;
		font-size: 3.5rem;
		transition:
			transform 0.2s,
			box-shadow 0.2s,
			border-color 0.2s;
	}
	.option:hover,
	.option:focus-visible {
		border-color: #4299e1;
		transform: translateY(-5px) scale(1.04);
		box-shadow: 0 10px 20px rgb(66 153 225 / 20%);
		outline: none;
	}
	.option:active {
		transform: scale(0.96);
	}
	.option.wrong {
		border-color: #f56565;
		background: #fed7d7;
		animation: shake 0.4s ease-in-out;
	}
	.option.correct-option {
		animation: flyToGap 0.55s ease-in forwards;
		pointer-events: none;
	}
	.success-message {
		margin: 1.25rem auto 0;
		width: fit-content;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		background: #c6f6d5;
		color: #276749;
		font-weight: 700;
		animation: appear 0.25s ease-out;
	}
	.hint {
		margin: 1rem auto 0;
		max-width: 600px;
		padding: 0.85rem 1rem;
		border-left: 4px solid #ecc94b;
		border-radius: 8px;
		background: #fefcbf;
		color: #744210;
		animation: slideDown 0.3s ease-out;
	}
	.actions {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}
	button {
		font: inherit;
	}
	.secondary-button,
	.primary-button,
	.next-button {
		border: 0;
		border-radius: 12px;
		padding: 0.75rem 1.15rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			transform 0.15s,
			background 0.15s;
	}
	.secondary-button {
		background: #edf2f7;
		color: #4a5568;
	}
	.secondary-button:hover:not(:disabled) {
		background: #e2e8f0;
		transform: translateY(-2px);
	}
	.secondary-button:disabled {
		cursor: default;
		opacity: 0.65;
	}
	.secondary-button.skip {
		color: #9b2c2c;
	}
	.next-button,
	.primary-button {
		display: block;
		margin: 1.25rem auto 0;
		background: #4299e1;
		color: white;
	}
	.next-button:hover,
	.primary-button:hover {
		background: #3182ce;
		transform: translateY(-2px);
	}
	.finish-card {
		margin: 4rem auto;
		max-width: 520px;
		padding: 3rem 2rem;
		border-radius: 24px;
		background: white;
		text-align: center;
		box-shadow: 0 10px 30px rgb(45 55 72 / 12%);
		animation: appear 0.4s ease-out;
	}
	.finish-icon {
		font-size: 4rem;
	}
	.finish-card h1 {
		margin: 0.75rem 0;
	}
	.finish-card p {
		color: #718096;
	}
	.result-stats {
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		margin: 1.5rem 0;
		color: #4a5568;
	}
	@keyframes appear {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@keyframes correctPulse {
		50% {
			transform: scale(1.03);
			box-shadow: 0 0 0 12px rgb(72 187 120 / 18%);
		}
	}
	@keyframes shake {
		25% {
			transform: translateX(-8px);
		}
		75% {
			transform: translateX(8px);
		}
	}
	@keyframes flyToGap {
		0% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		55% {
			opacity: 1;
			transform: translateY(-55px) scale(0.8);
		}
		100% {
			opacity: 0;
			transform: translateY(-115px) scale(0.45);
		}
	}
	@keyframes answerArrives {
		0% {
			opacity: 0.3;
			transform: scale(0.55);
		}
		65% {
			transform: scale(1.15);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
	@media (max-width: 600px) {
		.logic-game {
			padding: 0.75rem 1rem 2rem;
		}
		.game-heading {
			align-items: center;
		}
		.score {
			font-size: 0.8rem;
		}
		.sequence-card {
			min-height: 125px;
			padding: 1rem 0.5rem;
		}
		.options {
			gap: 0.5rem;
		}
		.option {
			flex: 1;
			width: auto;
			max-width: 100px;
			height: 82px;
			font-size: 2.8rem;
		}
		.actions {
			flex-direction: column;
			align-items: stretch;
		}
		.secondary-button {
			width: 100%;
		}
		.result-stats {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
