
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class CharRange extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['charRange'];
  }

  usage() {
    return [
      'charRange(<start>, <end>)',
    ];
  }

  examples() {
    return [
      '/s From a to z: ${charRange(97,122)}',
      '/s ${charRange(0x2600,0x2603)}',
      '/b ${charRange(0x2600,0x2603)}',
    ];
  }

  type() {
    return 'STRING';
  }

  info() {
    return 'generate sequential characters';
  }

  run(params) {
    let start = 32;
    let end = 126;
    if (params.length === 1) {
      end = this._dwst.lib.utils.parseNum(params[0]);
    }
    if (params.length === 2) {
      start = this._dwst.lib.utils.parseNum(params[0]);
      end = this._dwst.lib.utils.parseNum(params[1]);
    }
    let str = '';
    for (let i = start; i <= end; i++) {
      str += String.fromCodePoint(i);
    }
    return str;
  }
}
