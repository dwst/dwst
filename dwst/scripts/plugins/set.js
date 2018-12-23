
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Set {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['set'];
  }

  usage() {
    return [
      '/set <variable> <value>',
    ];
  }

  examples() {
    return [
      '/set foo 123',
    ];
  }

  info() {
    return 'set variable';
  }

  async run(paramString) {
    const [variableName, ...templateExpressionParts] = paramString.split(' ');
    if (variableName.length === 0) {
      throw new this._dwst.lib.errors.InvalidArgument(variableName, ['expected variable name']);
    }
    const templateExpression = templateExpressionParts.join(' ');
    const buffer = await this._dwst.controller.template.eval(templateExpression);
    this._dwst.model.variables.setVariable(variableName, buffer);
    this._dwst.ui.terminal.mlog([
      `${buffer.byteLength}B of data stored in variable ${variableName}`,
    ], 'system');
  }
}

