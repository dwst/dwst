
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class RandomBytes extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['randomBytes'];
  }

  usage() {
    return [
      'randomBytes(<number>)',
    ];
  }

  examples() {
    return [
      '/s rpc(${randomBytes(5)})',
      '/b ${randomBytes(16)}',
    ];
  }

  type() {
    return 'BINARY';
  }

  info() {
    return 'generate random bytes';
  }

  run(params) {
    const randombyte = () => {
      const out = Math.floor(Math.random() * (0xff + 1));
      return out;
    };
    let num = 16;
    if (params.length === 1) {
      num = this._dwst.lib.utils.parseNum(params[0]);
    }
    const bytes = [];
    for (let i = 0; i < num; i++) {
      bytes.push(randombyte());
    }
    return new Uint8Array(bytes);
  }
}
