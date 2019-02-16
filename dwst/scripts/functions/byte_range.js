
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/abstract/function.js';

export default class ByteRange extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['byteRange'];
  }

  usage() {
    return [
      'byteRange(<start>, <end>)',
    ];
  }

  examples() {
    return [
      '/s From a to z: ${byteRange(97,122)}',
      '/b ${byteRange(0,0xff)}',
    ];
  }

  info() {
    return 'generate sequential bytes';
  }

  run(args) {
    let start = 0;
    let end = 0xff;
    if (args.length === 1) {
      end = args[0].value;
    }
    if (args.length === 2) {
      start = args[0].value;
      end = args[1].value;
    }
    const bytes = [];
    for (let i = start; i <= end; i++) {
      bytes.push(i);
    }
    return new Uint8Array(bytes);
  }
}
