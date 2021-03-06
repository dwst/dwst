
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/abstract/function.js';

export default class Time extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['time'];
  }

  usage() {
    return [
      'time()',
    ];
  }

  examples() {
    return [
      '/s ${time()}s since epoch',
      '/b ${time()}',
    ];
  }

  info() {
    return 'generate utf-8 encoded timestamp';
  }

  run() {
    return String(Math.round(new Date().getTime() / 1000));
  }
}
