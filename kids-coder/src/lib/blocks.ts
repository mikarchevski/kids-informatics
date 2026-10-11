import * as Blockly from 'blockly';

export function defineCustomBlocks() {
  // Идти вперёд
  Blockly.Blocks['move_forward'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('🚗 Ехать вперёд');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машинка поедет вперёд');
    }
  };
  
  Blockly.Blocks['move_backward']={
    init: function() {
      this.appendDummyInput()
        .appendField('🔙 Ехать назад');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машинка поедет назад');
    }
  } 

  // Шаг вверх
  Blockly.Blocks['move_up'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('⬆️ Ехать вверх');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машина поедет вверх');
    }
  };

  // Шаг вниз
  Blockly.Blocks['move_down'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('⬇️ Ехать вниз');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машинка поедет вниз');
    }
  };

  // Повернуть влево
  Blockly.Blocks['turn_left'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('↩️ Повернуться влево');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машинка повернет влево');
    }
  };

  // Повернуть вправо
  Blockly.Blocks['turn_right'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('↪️ Повернуться вправо');
      this.setPreviousStatement(true);
      this.setNextStatement(true);
      this.setColour('#4C97FF');
      this.setTooltip('Машинка повернет вправо');
    }
  };
}