
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/abstract/function.js';

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

  info() {
    return 'generate random utf-8 encoded characters';
  }

  run(args) {
    const randomchar = () => {
      const out = Math.floor(Math.random() * (0xffff + 1));
      const char = String.fromCodePoint(out);
      return char;
    };
    let num = 16;
    if (args.length === 1) {
      num = args[0].value;
    }
    let str = '';
    for (let i = 0; i < num; i++) {
      str += randomchar();
    }
    return str;
  }
}
