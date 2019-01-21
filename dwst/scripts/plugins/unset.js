
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Unset {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['unset'];
  }

  usage() {
    return [
      '/unset <variable>',
    ];
  }

  examples() {
    return [
      '/unset foo',
    ];
  }

  info() {
    return 'delete variable';
  }

  run(variableName) {
    if (variableName.length === 0) {
      throw new this._dwst.types.errors.InvalidArgument(variableName, ['expected variable name']);
    }
    const buffer = this._dwst.model.variables.getVariable(variableName);
    if (buffer === null) {
      throw new this._dwst.types.errors.UnknownVariable(variableName);
    }
    this._dwst.model.variables.deleteVariable(variableName);
    this._dwst.ui.terminal.mlog([
      `Variable ${variableName} deleted`,
    ], 'system');
  }
}

