
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';

export default class Interval {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['interval'];
  }

  usage() {
    return [
      '/interval <interval> [command line...]',
      '/interval',
    ];
  }

  examples() {
    return [
      '/interval 1000',
      '/interval 1000 /binary [random(10)]',
      '/interval',
    ];
  }

  info() {
    return 'run an other command periodically';
  }

  run(intervalStr = null, ...commandParts) {
    if (intervalStr === null) {
      if (this._dwst.intervalId === null) {
        this._dwst.terminal.log('no interval to clear', 'error');
      } else {
        clearInterval(this._dwst.intervalId);
        this._dwst.terminal.log('interval cleared', 'system');
      }
      return;
    }
    let count = 0;
    const interval = utils.parseNum(intervalStr);
    const spammer = () => {
      if (this._dwst.connection === null || !this._dwst.connection.isOpen()) {
        if (this._dwst.intervalId !== null) {
          this._dwst.terminal.log('interval failed, no connection', 'error');
          this._dwst.controller.run('interval');
        }
        return;
      }
      if (commandParts.length < 1) {
        this._dwst.controller.run('send', String(count));
        count += 1;
        return;
      }
      this._dwst.controller.silent(commandParts.join(' '));
    };
    if (this._dwst.intervalId !== null) {
      this._dwst.terminal.log('clearing old interval', 'system');
      clearInterval(this._dwst.intervalId);
    }
    this._dwst.intervalId = setInterval(spammer, interval);
    this._dwst.terminal.log('interval set', 'system');
  }
}
