<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Blockly from 'blockly';
  import { defineCustomBlocks } from '#lib/blocks';
  import { Interpreter } from '#lib/interpreter';
  import Screen from '#lib/Screen.svelte';

  const GRID_SIZE = 10;

  let workspace: Blockly.WorkspaceSvg | null = $state(null);
  let blocklyDiv: HTMLDivElement = $state() as HTMLDivElement;
  let robotPosition = $state({ x: 0, y: 5, direction: 'right' });
  let interpreter: Interpreter = $state() as Interpreter;
  let batteries = $state<{ x: number; y: number }[]>([]);
  let score = $state(0);

  function handleKeyDown(event: KeyboardEvent) {
    if (!workspace) return;
    
    if (event.key === 'Delete' || event.key === 'Backspace') {
      const selected = Blockly.getSelected();
      if (selected && selected instanceof Blockly.Block) {
        selected.dispose(false, true);
        event.preventDefault();
      }
    }
  }

  function addBattery() {
    const freeCells: { x: number; y: number }[] = [];
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (x === robotPosition.x && y === robotPosition.y) continue;
        if (batteries.some(b => b.x === x && b.y === y)) continue;
        freeCells.push({ x, y });
      }
    }
    
    if (freeCells.length === 0) {
      alert('На поле нет свободных клеток!');
      return;
    }
    
    const randomCell = freeCells[Math.floor(Math.random() * freeCells.length)];
    batteries = [...batteries, randomCell];
  }

  function checkBatteryPickup(x: number, y: number) {
    const batteryIndex = batteries.findIndex(b => b.x === x && b.y === y);
    if (batteryIndex !== -1) {
      batteries = batteries.filter((_, i) => i !== batteryIndex);
      score += 1;
    }
  }

  onMount(() => {
    defineCustomBlocks();
    
    workspace = Blockly.inject(blocklyDiv, {
      toolbox: {
        kind: 'flyoutToolbox',
        contents: [
          { kind: 'block', type: 'move_forward' },
          { kind: 'block', type: 'move_backward' },
          { kind: 'block', type: 'turn_left' },
          { kind: 'block', type: 'turn_right' }
        ]
      },
      scrollbars: true,
      sounds: false,
      move: {
        scrollbars: true,
        drag: true,
        wheel: false
      }
    });
    
    interpreter = new Interpreter(workspace, (pos) => {
      robotPosition = { ...pos };
      checkBatteryPickup(pos.x, pos.y);
    });
    
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  function runCode() {
    if (interpreter) {
      interpreter.execute();
    }
  }

  function resetRobot() {
    robotPosition = { x: 5, y: 5, direction: 'right' };
    batteries = [];
    score = 0;
    if (interpreter) {
      interpreter.reset();
    }
  }
  function clearWorkspace() {
  if (workspace) {
    workspace.clear();
  }
}
</script>

<div class="app">
  <header class="app-header">
  <a href="/" class="home-link">← На главную</a>
    <h1>🚗 Машинка-программист</h1>
    <div class="controls">
      <button onclick={runCode} class="btn btn-primary">▶ Запустить</button>
      <button onclick={resetRobot} class="btn btn-secondary">↺ Сброс</button>
    </div>
  </header>
  
  <div class="app-main">
    <div class="blockly-area">
      <div bind:this={blocklyDiv} class="blockly-div"></div>
       <!--  Кастомная корзина в правом нижнем углу -->
    <button class="custom-trashcan" onclick={clearWorkspace} title="Очистить все блоки">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    </button>
    </div>

    
    
    <div class="screen-area">
        <Screen position={robotPosition} {batteries} {score} onAddBattery={addBattery} />

    </div>
  </div>
</div>