
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Bin {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['bin'];
  }

  usage() {
    return [
      'bin(<variable name>)',
    ];
  }

  examples() {
    return [
      '/s ${bin(foo)}',
      '/b ${bin(foo)}',
    ];
  }

  type() {
    return 'BINARY';
  }

  info() {
    return 'read binary variable';
  }

  run(params) {
    let variable = 'default';
    if (params.length === 1) {
      variable = params[0];
    }
    let buffer = this._dwst.model.bins.get(variable);
    if (typeof buffer === 'undefined') {
      buffer = [];
    }
    return new Uint8Array(buffer);
  }
}
