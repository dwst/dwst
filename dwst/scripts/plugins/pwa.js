
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Pwa {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['pwa'];
  }

  usage() {
    return [
      '/pwa <action>',
    ];
  }

  examples() {
    return [
      '/pwa install',
    ];
  }

  info() {
    return 'control progressive web application features';
  }

  run(...args) {
    if (args[0] === 'install') {
      this._dwst.controller.pwa.onInstall();
    }
  }
}
