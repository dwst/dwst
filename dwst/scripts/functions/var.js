
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class Var extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['var'];
  }

  usage() {
    return [
      'var(<variable name>)',
    ];
  }

  examples() {
    return [
      '/s ${var(foo)}',
      '/b ${var(foo)}',
    ];
  }

  type() {
    return 'VAR';
  }

  info() {
    return 'read variable';
  }

  run(params) {
    let variable = 'default';
    if (params.length === 1) {
      variable = params[0];
    }
    const value = this._dwst.model.variables.getVariable(variable);
    if (typeof value  === 'string') {
      return value;
    }
    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value);
    }
    if (value instanceof this._dwst.lib.types.DwstFunction) {
      throw new this._dwst.lib.errors.InvalidDataType(variable, ['STRING', 'BINARY']);
    }
    throw new this._dwst.lib.errors.UnknownVariable(variable);
  }
}
