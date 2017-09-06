
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Bins {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['bins'];
  }

  usage() {
    return [
      '/bins [name]',
    ];
  }

  examples() {
    return [
      '/bins',
      '/bins default',
    ];
  }

  info() {
    return 'list loaded binaries';
  }

  run(variable = null) {
    if (variable !== null) {
      const buffer = this._dwst.bins.get(variable);
      if (typeof buffer !== 'undefined') {
        this._dwst.blog(buffer, 'system');
        return;
      }
      const listTip = [
        'List available binaries by typing ',
        {
          type: 'command',
          text: '/bins',
        },
        '.',
      ];
      this._dwst.mlog([`Binary "${variable}" does not exist.`, listTip], 'error');
      return;
    }
    const listing = [...this._dwst.bins.entries()].map(([name, buffer]) => {
      return `"${name}": <${buffer.byteLength}B of binary data>`;
    });
    const strs = ['Loaded binaries:'].concat(listing);
    this._dwst.mlog(strs, 'system');
  }
}
