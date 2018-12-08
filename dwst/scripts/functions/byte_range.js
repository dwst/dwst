
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class ByteRange {

  constructor(dwst) {
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

  type() {
    return 'BINARY';
  }

  info() {
    return 'generate sequential bytes';
  }

  run(params) {
    let start = 0;
    let end = 0xff;
    if (params.length === 1) {
      end = this._dwst.lib.utils.parseNum(params[0]);
    }
    if (params.length === 2) {
      start = this._dwst.lib.utils.parseNum(params[0]);
      end = this._dwst.lib.utils.parseNum(params[1]);
    }
    const bytes = [];
    for (let i = start; i <= end; i++) {
      bytes.push(i);
    }
    return new Uint8Array(bytes);
  }
}
