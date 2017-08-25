
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Forget {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['forget'];
  }

  usage() {
    return [
      '/forget everything',
    ];
  }

  examples() {
    return [
      '/forget everything',
    ];
  }

  info() {
    return 'empty history';
  }

  _removeHistory() {
    this._dwst.historyManager.forget();
    const historyLine = this._dwst.historyManager.getSummary().concat(['.']);
    this._dwst.terminal.mlog(['Successfully forgot stored history!', historyLine], 'system');
  }

  run(target) {
    if (target === 'everything') {
      this._removeHistory();
      this._dwst.terminal.log("You may wish to use your browser's cleaning features to remove tracking cookies and other remaining traces.", 'warning');
    } else {
      const historyLine = this._dwst.historyManager.getSummary().concat(['.']);
      this._dwst.terminal.mlog([`Invalid argument: ${target}`, historyLine], 'error');
    }
  }

}
