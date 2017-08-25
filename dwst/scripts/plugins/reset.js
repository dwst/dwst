
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Reset {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['reset'];
  }

  usage() {
    return [
      '/reset',
    ];
  }

  examples() {
    return [
      '/reset',
    ];
  }

  info() {
    return 'reset the message buffer';
  }

  run() {
    document.getElementById('ter1').innerHTML = '';
  }
}

