<script lang="ts">
	import { onMount } from 'svelte';

	type Direction = 'up' | 'down' | 'left' | 'right';
	type Edge = 'top' | 'bottom' | 'left' | 'right';

	interface Command {
		direction: Direction;
		steps: number;
	}

	let gridSize = $state(7);
	let edges = $state<Set<string>>(new Set());
	let isDrawing = $state(false);
	let lastCell = $state<{ x: number; y: number } | null>(null);
	let lastDirection = $state<Direction | null>(null);

	// НОВОЕ: запоминаем путь рисования
	let drawPath = $state<{ x: number; y: number; direction: Direction }[]>([]);

	let levelName = $state('');
	let levelEmoji = $state('');
	let levelDescription = $state('');
	let commands = $state<Command[]>([]);
	let savedLevels = $state<any[]>([]);

	function initCanvas() {
		edges = new Set();
		lastCell = null;
		lastDirection = null;
		drawPath = [];
		commands = [];
	}

	function getEdgeKey(x: number, y: number, edge: Edge): string {
		return `${x},${y},${edge}`;
	}

	function getEdgeForDirection(dir: Direction): Edge {
		switch (dir) {
			case 'right':
				return 'bottom';
			case 'left':
				return 'top';
			case 'up':
				return 'right';
			case 'down':
				return 'left';
		}
	}

	function handleCellInteraction(x: number, y: number) {
		if (lastCell === null) {
			lastCell = { x, y };
			lastDirection = null;
		} else {
			const dx = x - lastCell.x;
			const dy = y - lastCell.y;

			if (Math.abs(dx) + Math.abs(dy) === 1) {
				let currentDirection: Direction;
				if (dx === 1) currentDirection = 'right';
				else if (dx === -1) currentDirection = 'left';
				else if (dy === 1) currentDirection = 'down';
				else currentDirection = 'up';

				const edge = getEdgeForDirection(currentDirection);
				const newEdges = new Set(edges);

				const isTurn = lastDirection !== null && lastDirection !== currentDirection;

				if (isTurn) {
					// При повороте: рисуем только для угловой клетки (lastCell)
					newEdges.add(getEdgeKey(lastCell.x, lastCell.y, edge));
				} else {
					// При движении прямо: рисуем для обеих клеток
					newEdges.add(getEdgeKey(lastCell.x, lastCell.y, edge));
					newEdges.add(getEdgeKey(x, y, edge));
				}

				edges = newEdges;
				drawPath = [...drawPath, { x: lastCell.x, y: lastCell.y, direction: currentDirection }];
				lastCell = { x, y };
				lastDirection = currentDirection;
			} else {
				lastCell = { x, y };
				lastDirection = null;
			}
		}
	}

	function rebuildEdgesFromPath() {
		const rebuiltEdges = new Set<string>();

		if (drawPath.length === 0) {
			edges = rebuiltEdges;
			return;
		}

		let currentX = drawPath[0].x;
		let currentY = drawPath[0].y;
		let previousDirection: Direction | null = null;

		for (const step of drawPath) {
			const edge = getEdgeForDirection(step.direction);
			let nextX = currentX;
			let nextY = currentY;

			switch (step.direction) {
				case 'right':
					nextX++;
					break;
				case 'left':
					nextX--;
					break;
				case 'down':
					nextY++;
					break;
				case 'up':
					nextY--;
					break;
			}

			const isTurn = previousDirection !== null && previousDirection !== step.direction;
			rebuiltEdges.add(getEdgeKey(currentX, currentY, edge));
			if (!isTurn) {
				rebuiltEdges.add(getEdgeKey(nextX, nextY, edge));
			}

			currentX = nextX;
			currentY = nextY;
			previousDirection = step.direction;
		}

		edges = rebuiltEdges;
	}

	// Отменить последний шаг
	function undoLastStep() {
		if (drawPath.length === 0) return;

		drawPath = drawPath.slice(0, -1);
		rebuildEdgesFromPath();

		if (drawPath.length === 0) {
			lastCell = null;
			lastDirection = null;
		} else {
			const lastStep = drawPath[drawPath.length - 1];
			lastDirection = lastStep.direction;
			let x = lastStep.x;
			let y = lastStep.y;
			if (lastStep.direction === 'right') x++;
			else if (lastStep.direction === 'left') x--;
			else if (lastStep.direction === 'down') y++;
			else y--;
			lastCell = { x, y };
		}

		commands = [];
	}

	function generateCommands() {
		commands = [];

		if (drawPath.length === 0) {
			alert('Сначала нарисуйте фигуру!');
			return;
		}

		// Генерируем команды напрямую из пути рисования
		let currentDir = drawPath[0].direction;
		let steps = 1;

		for (let i = 1; i < drawPath.length; i++) {
			if (drawPath[i].direction === currentDir) {
				steps++;
			} else {
				commands.push({ direction: currentDir, steps });
				currentDir = drawPath[i].direction;
				steps = 1;
			}
		}

		// Добавляем последнюю команду
		if (steps > 0) {
			commands.push({ direction: currentDir, steps });
		}

		if (commands.length > 0) {
			alert(`✅ Сгенерировано ${commands.length} команд!`);
		}
	}

	async function saveLevel() {
		if (!levelName) {
			alert('Введите название уровня!');
			return;
		}
		if (commands.length === 0) {
			alert('Сначала сгенерируйте команды!');
			return;
		}

		// Стартовая точка — первая клетка пути
		const startX = drawPath[0].x;
		const startY = drawPath[0].y;

		const level = {
			name: levelName,
			emoji: levelEmoji,
			description: levelDescription,
			gridSize,
			startX,
			startY,
			commands
		};

		try {
			const response = await fetch('/api/admin/dictation-levels', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(level)
			});

			if (response.ok) {
				alert('✅ Уровень сохранён!');
				levelName = '';
				levelDescription = '';
				initCanvas();
				loadLevels();
			} else {
				alert('Ошибка сохранения');
			}
		} catch (error) {
			console.error('Ошибка:', error);
			alert('API недоступен');
		}
	}

	async function loadLevels() {
		try {
			const response = await fetch('/api/admin/dictation-levels');
			if (response.ok) savedLevels = await response.json();
		} catch (error) {
			console.log('API недоступен');
		}
	}

	async function deleteLevel(id: string) {
		if (!confirm('Удалить уровень?')) return;
		try {
			await fetch(`/api/admin/dictation-levels/${id}`, { method: 'DELETE' });
			loadLevels();
		} catch (error) {
			console.error('Ошибка:', error);
		}
	}

	onMount(() => {
		initCanvas();
		loadLevels();
	});
</script>

<svelte:head>
	<title>Редактор графических диктантов</title>
</svelte:head>

<div class="editor-page">
	<header>
		<h1>🎨 Редактор графических диктантов</h1>
		<p>Зажмите мышь и ведите по клеткам — команды генерируются из пути рисования</p>
	</header>

	<div class="editor-layout">
		<aside class="settings-panel">
			<h3>Настройки уровня</h3>

			<div class="form-group">
				<label>Название:</label>
				<input type="text" bind:value={levelName} placeholder="Например: Домик" />
			</div>

			<div class="form-group">
				<label>Эмодзи:</label>
				<input type="text" bind:value={levelEmoji} maxlength="10" />
			</div>

			<div class="form-group">
				<label>Описание:</label>
				<textarea bind:value={levelDescription} rows="3"></textarea>
			</div>

			<div class="form-group">
				<label>Размер поля:</label>
				<select bind:value={gridSize} onchange={initCanvas}>
					<option value="5">5×5</option>
					<option value="7">7×7</option>
					<option value="9">9×9</option>
					<option value="11">11×11</option>
				</select>
			</div>

			<button class="btn-primary" onclick={generateCommands}> ⚡ Сгенерировать команды </button>

			<button class="btn-success" onclick={saveLevel} disabled={commands.length === 0}>
				💾 Сохранить уровень
			</button>
		</aside>

		<main class="canvas-area">
			<h3>Рисуйте контур (зажмите мышь и ведите)</h3>

			<div
				class="canvas-container"
				onmousedown={() => (isDrawing = true)}
				onmouseup={() => (isDrawing = false)}
				onmouseleave={() => (isDrawing = false)}
			>
				<div class="canvas-grid" style="grid-template-columns: repeat({gridSize}, 1fr);">
					{#each Array(gridSize * gridSize) as _, index}
						{@const x = index % gridSize}
						{@const y = Math.floor(index / gridSize)}

						<button
							type="button"
							class="canvas-cell"
							class:has-top={edges.has(getEdgeKey(x, y, 'top'))}
							class:has-bottom={edges.has(getEdgeKey(x, y, 'bottom'))}
							class:has-left={edges.has(getEdgeKey(x, y, 'left'))}
							class:has-right={edges.has(getEdgeKey(x, y, 'right'))}
							class:is-start={lastCell && lastCell.x === x && lastCell.y === y}
							onmousedown={(e) => {
								e.preventDefault();
								handleCellInteraction(x, y);
							}}
							onmouseenter={() => isDrawing && handleCellInteraction(x, y)}
						/>
					{/each}
				</div>
			</div>

			<button class="btn-secondary" onclick={initCanvas}> ️ Очистить холст </button>
		</main>

		<aside class="commands-panel">
			<h3>Команды ({commands.length})</h3>

			{#if commands.length > 0}
				<div class="commands-list">
					{#each commands as cmd, i}
						<div class="command-item">
							<span class="command-number">{i + 1}.</span>
							<span class="command-arrow">
								{cmd.direction === 'up'
									? '⬆️'
									: cmd.direction === 'down'
										? '️'
										: cmd.direction === 'left'
											? '⬅️'
											: '➡️'}
							</span>
							<span class="command-text">
								{cmd.steps}
								{cmd.steps === 1 ? 'клетка' : cmd.steps < 5 ? 'клетки' : 'клеток'}
								{cmd.direction === 'up'
									? 'вверх'
									: cmd.direction === 'down'
										? 'вниз'
										: cmd.direction === 'left'
											? 'влево'
											: 'вправо'}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty-state">Нарисуйте контур и нажмите "Сгенерировать"</p>
			{/if}
		</aside>
	</div>

	<section class="saved-levels">
		<h3>Сохранённые уровни ({savedLevels.length})</h3>
		{#if savedLevels.length > 0}
			<div class="levels-grid">
				{#each savedLevels as level}
					<div class="level-card">
						<div class="level-header">
							<span class="level-emoji">{level.emoji}</span>
							<h4>{level.name}</h4>
						</div>
						<div class="level-meta">
							<span> {level.gridSize}×{level.gridSize}</span>
							<span>📝 {level.commands?.length || 0} команд</span>
						</div>
						<button class="btn-danger" onclick={() => deleteLevel(level.id)}> 🗑️ Удалить </button>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty-state">Нет сохранённых уровней</p>
		{/if}
	</section>
</div>

<style>
	.editor-page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}
	header {
		text-align: center;
		margin-bottom: 2rem;
	}
	header h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	header p {
		color: #718096;
	}

	.editor-layout {
		display: grid;
		grid-template-columns: 280px 1fr 320px;
		gap: 2rem;
		margin-bottom: 3rem;
	}
	.settings-panel,
	.commands-panel {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		height: fit-content;
	}
	.settings-panel h3,
	.commands-panel h3 {
		margin-bottom: 1rem;
		color: #2d3748;
	}

	.form-group {
		margin-bottom: 1rem;
	}
	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #4a5568;
	}
	.form-group input,
	.form-group textarea,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 2px solid #e2e8f0;
		border-radius: 8px;
		font-size: 1rem;
		box-sizing: border-box;
	}
	.form-group textarea {
		resize: vertical;
		font-family: inherit;
	}

	.btn-primary,
	.btn-success,
	.btn-secondary,
	.btn-danger {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		margin-bottom: 0.75rem;
	}
	.btn-primary {
		background: #4299e1;
		color: white;
	}
	.btn-primary:hover {
		background: #3182ce;
	}
	.btn-success {
		background: #48bb78;
		color: white;
	}
	.btn-success:hover:not(:disabled) {
		background: #38a169;
	}
	.btn-success:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.btn-secondary {
		background: #edf2f7;
		color: #4a5568;
	}
	.btn-secondary:hover {
		background: #e2e8f0;
	}
	.btn-danger {
		background: #f56565;
		color: white;
		padding: 0.5rem;
		font-size: 0.9rem;
	}
	.btn-danger:hover {
		background: #c53030;
	}

	.canvas-area {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
	.canvas-area h3 {
		margin-bottom: 1rem;
		color: #2d3748;
		text-align: center;
	}
	.canvas-container {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
		user-select: none;
	}
	.canvas-grid {
		display: grid;
		gap: 2px;
		max-width: 500px;
		width: 100%;
		aspect-ratio: 1;
		background: #cbd5e0;
		padding: 2px;
		border-radius: 8px;
	}

	.canvas-cell {
		aspect-ratio: 1;
		background: white;
		border: 1px solid #e2e8f0;
		cursor: crosshair;
		transition: background 0.1s;
		position: relative;
	}

	.canvas-cell:hover {
		background: #f7fafc;
	}

	.canvas-cell.has-top {
		border-top: 3px solid #4299e1;
	}
	.canvas-cell.has-bottom {
		border-bottom: 3px solid #4299e1;
	}
	.canvas-cell.has-left {
		border-left: 3px solid #4299e1;
	}
	.canvas-cell.has-right {
		border-right: 3px solid #4299e1;
	}

	.canvas-cell.is-start {
		background: #f6e05e;
	}
	.canvas-cell.is-start::after {
		content: '●';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #2d3748;
		font-size: 1.5rem;
	}

	.commands-list {
		max-height: 400px;
		overflow-y: auto;
	}
	.command-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #f7fafc;
		border-radius: 6px;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}
	.command-number {
		font-weight: 700;
		color: #4299e1;
		min-width: 24px;
	}
	.command-arrow {
		font-size: 1.2rem;
	}
	.empty-state {
		text-align: center;
		color: #718096;
		padding: 2rem;
	}

	.saved-levels {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}
	.saved-levels h3 {
		margin-bottom: 1rem;
		color: #2d3748;
	}
	.levels-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
	}
	.level-card {
		background: #f7fafc;
		padding: 1rem;
		border-radius: 8px;
		border: 2px solid #e2e8f0;
	}
	.level-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.level-emoji {
		font-size: 1.5rem;
	}
	.level-header h4 {
		margin: 0;
		color: #2d3748;
	}
	.level-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: #4a5568;
		margin-bottom: 0.75rem;
	}

	@media (max-width: 1024px) {
		.editor-layout {
			grid-template-columns: 1fr;
		}
	}
</style>
