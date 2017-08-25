
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Disconnect {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['disconnect'];
  }

  usage() {
    return [
      '/disconnect',
    ];
  }

  examples() {
    return [
      '/disconnect',
    ];
  }

  info() {
    return 'disconnect from a server';
  }

  run() {
    if (this._dwst.terminal.connection === null) {
      this._dwst.terminal.log('No connection to disconnect', 'warning');
    }
    const protocol = [];
    this._dwst.terminal.mlog([`Closing connection to ${this._dwst.connection.url}`].concat(protocol), 'system');
    this._dwst.connection.close();
  }
}

