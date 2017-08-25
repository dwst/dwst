
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Texts {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['texts'];
  }

  usage() {
    return [
      '/texts',
      '/texts [name]',
    ];
  }

  examples() {
    return [
      '/texts',
      '/texts default',
    ];
  }

  info() {
    return 'list loaded texts';
  }

  run(variable = null) {
    if (variable !== null) {
      const text = this._dwst.texts.get(variable);
      if (typeof text  !== 'undefined') {
        this._dwst.terminal.log(text, 'system');
        return;
      }
      const listTip = [
        'List available texts by typing ',
        {
          type: 'command',
          text: '/texts',
        },
        '.',
      ];
      this._dwst.terminal.mlog([`Text "${variable}" does not exist.`, listTip], 'error');
    }
    const listing = [...this._dwst.texts.entries()].map(([name, text]) => {
      return `"${name}": <${text.length}B of text data>`;
    });
    const strs = ['Loaded texts:'].concat(listing);
    this._dwst.terminal.mlog(strs, 'system');
  }
}

