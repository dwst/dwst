
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class RandomChars extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['randomChars'];
  }

  usage() {
    return [
      'randomChars(<number>)',
    ];
  }

  examples() {
    return [
      '/s ${randomChars(10)}',
      '/b ${randomChars(10)}',
    ];
  }

  type() {
    return 'STRING';
  }

  info() {
    return 'generate random characters';
  }

  run(params) {
    const randomchar = () => {
      const out = Math.floor(Math.random() * (0xffff + 1));
      const char = String.fromCodePoint(out);
      return char;
    };
    let num = 16;
    if (params.length === 1) {
      num = this._dwst.lib.utils.parseNum(params[0]);
    }
    let str = '';
    for (let i = 0; i < num; i++) {
      str += randomchar();
    }
    return str;
  }
}
