import * as Blockly from 'blockly';

export function defineCustomBlocks() {
	// Идти вперёд
	Blockly.Blocks['move_forward'] = {
		init: function () {
			this.appendDummyInput().appendField('➤ Двигаться вперёд');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение вперёд');
		}
	};

	Blockly.Blocks['move_backward'] = {
		init: function () {
			this.appendDummyInput().appendField('◀ Двигаться назад');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение назад');
		}
	};

	// Шаг вверх
	Blockly.Blocks['move_up'] = {
		init: function () {
			this.appendDummyInput().appendField('⬆️ Двигаться вверх');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение вверх');
		}
	};

	// Шаг вниз
	Blockly.Blocks['move_down'] = {
		init: function () {
			this.appendDummyInput().appendField('⬇️ Двигаться вниз');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение вниз');
		}
	};

	// Повернуть влево
	Blockly.Blocks['turn_left'] = {
		init: function () {
			this.appendDummyInput().appendField('↺ Повернуться влево');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение влево');
		}
	};

	// Повернуть вправо
	Blockly.Blocks['turn_right'] = {
		init: function () {
			this.appendDummyInput().appendField('↻ Повернуться вправо');
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.setColour('#4C97FF');
			this.setTooltip('Одно движение вправо');
		}
	};
}
