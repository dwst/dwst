
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';

export default class Spam {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['spam'];
  }

  usage() {
    return [
      '/spam <times> [command line...]',
    ];
  }

  examples() {
    return [
      '/spam 10',
      '/spam 6 /binary ${random(10)}',
    ];
  }

  info() {
    return 'run a command multiple times';
  }

  _run(timesStr, ...commandParts) {
    const times = utils.parseNum(timesStr);
    const [command, payload] = (() => {
      if (commandParts.length < 1) {
        return ['send', null];
      }
      const firstPart = commandParts[0];
      const otherParts = commandParts.slice(1);
      if (['/s', '/send', '/b', '/binary'].includes(firstPart) === false) {
        this._dwst.ui.terminal.mlog([
          [
            'Invalid ',
            {
              type: 'dwstgg',
              text: 'spam',
              section: 'spam',
            },
            ' command combination.',
          ],
          'Compatible commands: send, binary',
        ], 'error');
        return [null, null];
      }
      return [firstPart.slice(1), otherParts.join(' ')];
    })();
    if (command === null) {
      return;
    }
    const spam = (limit, i = 0) => {
      if (i === limit) {
        return;
      }
      const message = (() => {
        if (payload === null) {
          return String(i);
        }
        return payload;
      })();
      if (this._dwst.connection === null || this._dwst.connection.isOpen() === false) {
        this._dwst.ui.terminal.log('spam failed, no connection', 'error');
        return;
      }
      this._dwst.controller.run([command, message].join(' '));
      const nextspam = () => {
        spam(limit, i + 1);
      };
      setTimeout(nextspam, 0);
    };
    spam(times);
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

