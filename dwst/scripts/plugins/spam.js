
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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
      '/spam 6 /binary ${randomBytes(10)}',
    ];
  }

  info() {
    return 'run a command multiple times';
  }

  _run(timesStr, ...commandParts) {
    const times = this._dwst.lib.utils.parseNum(timesStr);
    const [command, payload] = (() => {
      if (commandParts.length < 1) {
        return ['send', null];
      }
      const firstPart = commandParts[0];
      const otherParts = commandParts.slice(1);
      if (['/s', '/send', '/b', '/binary'].includes(firstPart) === false) {
        throw new this._dwst.lib.errors.InvalidCombination('spam', ['send', 'binary']);
      }
      return [firstPart.slice(1), otherParts.join(' ')];
    })();
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
      if (this._dwst.model.connection === null || this._dwst.model.connection.isOpen() === false) {
        throw new this._dwst.lib.errors.NoConnection(message);
      }
      this._dwst.controller.prompt.run([command, message].join(' '));
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

