/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/abstract/function.js';

export default class RandomBytes extends DwstFunction {
  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['randomBytes'];
  }

  usage() {
    return ['randomBytes(<number>)'];
  }

  examples() {
    return ['/b ${randomBytes(16)}'];
  }

  info() {
    return 'generate random bytes';
  }

  run(args) {
    let num = 16;
    if (args.length === 1) {
      num = args[0].value;
    }
    const bytes = new Uint8Array(num);
    crypto.getRandomValues(bytes);
    return bytes;
  }
}
