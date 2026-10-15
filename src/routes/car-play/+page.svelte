<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import * as Blockly from 'blockly';
	import { defineCustomBlocks } from '#lib/blocks';
	import { Interpreter } from '#lib/interpreter';
	import Screen from '#lib/Screen.svelte';
	import './page.css';

	import Car from '#lib/avatars/Car.svelte';
	import Cat from '#lib/avatars/Cat.svelte';
	import Robot from '#lib/avatars/Robot.svelte';
	import Rocket from '#lib/avatars/Rocket.svelte';
	import Dino from '#lib/avatars/Dino.svelte';

	type CommandType = 'move_forward' | 'move_backward' | 'turn_left' | 'turn_right';
	type ProgramCommand = { id: string; type: CommandType };

	const DESKTOP_GRID_SIZE = 10;
	const MOBILE_GRID_SIZE = 8;

	const avatars = [
		{ id: 'car', name: 'Машинка', component: Car },
		{ id: 'cat', name: 'Кот Коржик', component: Cat },
		{ id: 'robot', name: 'Робот', component: Robot },
		{ id: 'rocket', name: 'Ракета', component: Rocket },
		{ id: 'dino', name: 'Динозаврик', component: Dino }
	];

	const commands: Record<CommandType, { icon: string; label: string }> = {
		move_forward: { icon: '⬆️', label: 'Вперёд' },
		move_backward: { icon: '⬇️', label: 'Назад' },
		turn_left: { icon: '↶', label: 'Влево' },
		turn_right: { icon: '↷', label: 'Вправо' }
	};
	const commandList: { type: CommandType; icon: string; label: string }[] = [
		{ type: 'move_forward', ...commands.move_forward },
		{ type: 'move_backward', ...commands.move_backward },
		{ type: 'turn_left', ...commands.turn_left },
		{ type: 'turn_right', ...commands.turn_right }
	];

	let workspace: Blockly.WorkspaceSvg | null = null;
	let blocklyDiv: HTMLDivElement;
	let robotPosition = $state({ x: 0, y: 4, direction: 'right' });
	let interpreter: Interpreter | null = null;
	let batteries = $state<{ x: number; y: number }[]>([]);
	let score = $state(0);
	let isMobileLayout = $state(false);
	let gridSize = $state(DESKTOP_GRID_SIZE);
	let program = $state<ProgramCommand[]>([]);
	let activeCommandId = $state<string | null>(null);
	let isMenuOpen = $state(false);
	let selectedAvatarId = $state('car');
	let hasLoadedAvatar = $state(false);

	const currentAvatar = $derived(
		avatars.find((avatar) => avatar.id === selectedAvatarId) ?? avatars[0]
	);

	$effect(() => {
		if (hasLoadedAvatar) localStorage.setItem('kids-coder-avatar', selectedAvatarId);
	});

	function updateRobotPosition(position: { x: number; y: number; direction: string }) {
		robotPosition = { ...position };
		const batteryIndex = batteries.findIndex(
			(battery) => battery.x === position.x && battery.y === position.y
		);
		if (batteryIndex !== -1) {
			batteries = batteries.filter((_, index) => index !== batteryIndex);
			score += 1;
		}
	}

	function createInterpreter() {
		if (!workspace) return;
		interpreter = new Interpreter(
			workspace,
			updateRobotPosition,
			gridSize,
			(blockId) => (activeCommandId = blockId)
		);
	}

	function addCommand(type: CommandType) {
		if (!workspace) return;

		const block = workspace.newBlock(type);
		block.initSvg();
		block.render();

		const previousCommand = program.at(-1);
		const previousBlock = previousCommand ? workspace.getBlockById(previousCommand.id) : null;
		if (previousBlock?.nextConnection && block.previousConnection) {
			previousBlock.nextConnection.connect(block.previousConnection);
		}

		program = [...program, { id: block.id, type }];
	}

	function clearProgram() {
		workspace?.clear();
		program = [];
		activeCommandId = null;
	}

	function addBattery() {
		const freeCells: { x: number; y: number }[] = [];
		for (let x = 0; x < gridSize; x++) {
			for (let y = 0; y < gridSize; y++) {
				if (x === robotPosition.x && y === robotPosition.y) continue;
				if (batteries.some((battery) => battery.x === x && battery.y === y)) continue;
				freeCells.push({ x, y });
			}
		}

		if (freeCells.length === 0) {
			alert('На поле нет свободных клеток!');
			return;
		}

		batteries = [...batteries, freeCells[Math.floor(Math.random() * freeCells.length)]];
		isMenuOpen = false;
	}

	function clearField() {
		batteries = [];
		score = 0;
		interpreter?.reset();
		isMenuOpen = false;
	}

	async function runProgram() {
		if (!program.length || !interpreter) return;
		await interpreter.execute();
	}

	function handleViewportChange(event: MediaQueryListEvent) {
		if (event.matches === isMobileLayout) return;

		isMobileLayout = event.matches;
		gridSize = isMobileLayout ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
		robotPosition = {
			...robotPosition,
			x: Math.min(robotPosition.x, gridSize - 1),
			y: Math.min(robotPosition.y, gridSize - 1)
		};
		batteries = batteries.filter((battery) => battery.x < gridSize && battery.y < gridSize);
		createInterpreter();
	}

	function closeMenu() {
		isMenuOpen = false;
	}

	let mobileMediaQuery: MediaQueryList;

	onMount(() => {
		const savedAvatar = localStorage.getItem('kids-coder-avatar');
		if (avatars.some((avatar) => avatar.id === savedAvatar)) {
			selectedAvatarId = savedAvatar ?? 'car';
		}
		hasLoadedAvatar = true;

		defineCustomBlocks();
		mobileMediaQuery = window.matchMedia('(max-width: 900px) and (pointer: coarse)');
		isMobileLayout = mobileMediaQuery.matches;
		gridSize = isMobileLayout ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
		robotPosition = { x: 0, y: Math.floor(gridSize / 2), direction: 'right' };

		workspace = Blockly.inject(blocklyDiv, {
			sounds: false,
			trashcan: false,
			move: { scrollbars: false, drag: false, wheel: false }
		});
		createInterpreter();

		mobileMediaQuery.addEventListener('change', handleViewportChange);
	});

	onDestroy(() => {
		mobileMediaQuery?.removeEventListener('change', handleViewportChange);
		workspace?.dispose();
	});
</script>

<div class="game-layout">
	<header class="game-header">
		<a href="/" class="home-link">
			<span class="home-full">← На главную</span>
			<span class="home-short">←</span>
		</a>
		<h1>
			<span class="full-title">🖥️ Программное приключение</span>
			<span class="short-title">Приключение</span>
		</h1>
		<div class="header-actions" role="group" aria-label="Управление игрой">
			{#if !isMobileLayout}
				<select bind:value={selectedAvatarId} aria-label="Выбери героя">
					{#each avatars as avatar}
						<option value={avatar.id}>{avatar.name}</option>
					{/each}
				</select>
			{/if}
			<button class="run-button" onclick={runProgram} type="button">▶ Запустить</button>
			<button class="reset-button" onclick={clearField} type="button">↺ Сброс</button>
		</div>
	</header>

	<main class="game-content">
		<section class="scene-section" aria-label="Игровая сцена">
			<Screen
				position={robotPosition}
				{batteries}
				avatarComponent={currentAvatar.component}
				{gridSize}
			/>
		</section>

		<section class="program-section" aria-labelledby="program-title">
			<div class="program-heading">
				<h2 id="program-title">Программа</h2>
				<button
					class="menu-button"
					class:menu-open={isMenuOpen}
					onclick={() => (isMenuOpen = !isMenuOpen)}
					aria-label="Дополнительные действия"
					aria-expanded={isMenuOpen}
					aria-controls="game-menu"
					type="button"
				>
					⚙️
				</button>
			</div>

			<div class="program-list" aria-live="polite" aria-label="Добавленные команды">
				{#if program.length === 0}
					<p class="program-empty">Нажимай на кнопки внизу, чтобы добавить команды</p>
				{:else}
					{#each program as command, index (command.id)}
						{@const commandInfo = commands[command.type]}
						<div
							class="command-chip"
							class:active={activeCommandId === command.id}
							aria-current={activeCommandId === command.id ? 'step' : undefined}
						>
							<span class="command-number">{index + 1}</span>
							<span class="command-icon" aria-hidden="true">{commandInfo.icon}</span>
							<span>{commandInfo.label}</span>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	</main>

	<footer class="command-palette" role="group" aria-label="Добавить команду">
		{#each commandList as command (command.type)}
			<button
				class="command-button"
				onclick={() => addCommand(command.type)}
				aria-label={`Добавить команду: ${command.label}`}
				type="button"
			>
				<span class="palette-icon" aria-hidden="true">{command.icon}</span>
				<span>{command.label}</span>
			</button>
		{/each}
	</footer>

	<div class="blockly-host" bind:this={blocklyDiv} aria-hidden="true"></div>

	<button
		class="sheet-backdrop"
		class:visible={isMenuOpen}
		onclick={closeMenu}
		aria-label="Закрыть меню"
		aria-hidden={!isMenuOpen}
		tabindex={isMenuOpen ? 0 : -1}
		type="button"
	></button>
	<div
		id="game-menu"
		class="bottom-sheet"
		class:open={isMenuOpen}
		role="dialog"
		tabindex="-1"
		aria-modal={isMenuOpen}
		aria-hidden={!isMenuOpen}
		aria-labelledby="menu-title"
		inert={!isMenuOpen}
	>
		<div class="sheet-handle" aria-hidden="true"></div>
		<div class="sheet-heading">
			<h2 id="menu-title">Дополнительные действия</h2>
			<button class="close-menu" onclick={closeMenu} aria-label="Закрыть меню" type="button">
				✕
			</button>
		</div>
		<button class="sheet-action" onclick={addBattery} type="button">⭐ Добавить звезду</button>
		<p class="sheet-score">⭐ Счёт: {score}</p>
		<button class="sheet-action" onclick={clearField} type="button">🗑️ Очистить поле</button>
		<button class="sheet-action secondary-action" onclick={clearProgram} type="button">
			Очистить программу
		</button>
	</div>
</div>

<style src="./car-play.css"></style>
