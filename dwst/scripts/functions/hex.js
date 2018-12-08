
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

function hexpairtobyte(hp) {
  const hex = hp.join('');
  if (hex.length !== 2) {
    return null;
  }
  return parseInt(hex, 16);
}

export default class Hex {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['hex'];
  }

  usage() {
    return [
      'hex(<hex string>)',
    ];
  }

  examples() {
    return [
      '/b ${hex(1234567890abcdef)}',
      '/s ${hex(68656c6c6f)}',
    ];
  }

  type() {
    return 'BINARY';
  }

  info() {
    return 'generate bytes from hex decimal';
  }

  run(params) {
    let bytes;
    if (params.length === 1) {
      const hex = params[0];
      const nums = hex.split('');
      const pairs = this._dwst.lib.utils.chunkify(nums, 2);
      const tmp = pairs.map(hexpairtobyte);
      bytes = tmp.filter(b => (b !== null));
    } else {
      bytes = [];
    }
    return new Uint8Array(bytes);
  }
}
