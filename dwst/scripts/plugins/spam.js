
/**

  Authors: Toni Ruottu, Finland 2010-2019

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
      const [firstPart, ...otherParts] = commandParts;
      if (['/s', '/send', '/b', '/binary'].includes(firstPart) === false) {
        throw new this._dwst.types.errors.InvalidCombination('spam', ['send', 'binary']);
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
      this._dwst.controller.prompt.runPlugin(command, message).then(() => {
        const nextspam = () => {
          spam(limit, i + 1);
        };
        setTimeout(nextspam, 0);
      }).catch(error => {
        this._dwst.lib.utils.globalThrow(error);
      });
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

