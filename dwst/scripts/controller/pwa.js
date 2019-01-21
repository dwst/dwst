
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../types/m/m.js';

export default class PwaHandler {

  constructor(dwst) {
    this._dwst = dwst;
    this._prompt = null;
  }

  beforeInstallPrompt(evt) {
    this._prompt = evt;
    this._dwst.ui.terminal.mlog([
      m.line`Type ${m.command('/pwa install')} to install`,
    ], 'system');
  }

  onInstall() {
    if (this._prompt === null) {
      this._dwst.ui.terminal.mlog([
        'Installation not possible',
        '',
        'Possible reasons:',
        '  * App already installed',
        '  * App not frequently used',
        '  * Browser has no PWA support',
        '',
        'You could try manual pwa installation with "Add to home screen" or similar browser feature',
      ], 'warning');
      return;
    }
    this._prompt.prompt();
    this._prompt = null;
  }
}
