
/**

  Authors: Toni Ruottu, Finland 2010-2018

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

  _run(variable = null) {
    if (variable !== null) {
      const text = this._dwst.model.texts.get(variable);
      if (typeof text  !== 'undefined') {
        this._dwst.ui.terminal.log(text, 'system');
        return;
      }
      throw new this._dwst.lib.errors.UnknownText(variable);
    }
    const listing = [...this._dwst.model.texts.entries()].map(([name, text]) => {
      return `"${name}": <${text.length}B of text data>`;
    });
    const strs = ['Loaded texts:'].concat(listing);
    this._dwst.ui.terminal.mlog(strs, 'system');
  }

  run(paramString) {
    if (paramString.length < 1) {
      this._run();
      return;
    }
    const params = paramString.split(' ');
    this._run(...params);
  }
}

