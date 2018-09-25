
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';
import {parseParticles} from '../particles.js';
import {NoConnection, UnknownInstruction} from '../errors.js';

export default class Send {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['send', 's', ''];
  }

  usage() {
    return [
      '/send [template]',
      '/s [template]',
    ];
  }

  examples() {
    return [
      '/send Hello world!',
      '/send multiline\\r\\nmessage',
      '/send rpc(${random(5)})',
      '/send ${text()}',
      '/send ["JSON","is","cool"]',
      '/send ${time()}s since epoch',
      '/send From a to z: ${range(97,122)}',
      '/s Available now with 60% less typing!',
    ];
  }

  info() {
    return 'send textual data';
  }

  _process(instr, params) {
    if (instr === 'default') {
      return params[0];
    }
    if (instr === 'random') {
      const randomchar = () => {
        let out = Math.floor(Math.random() * (0xffff + 1));
        out /= 2; // avoid risky characters
        const char = String.fromCharCode(out);
        return char;
      };
      let num = 16;
      if (params.length === 1) {
        num = utils.parseNum(params[0]);
      }
      let str = '';
      for (let i = 0; i < num; i++) {
        str += randomchar();
      }
      return str;
    }
    if (instr === 'text') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      return this._dwst.texts.get(variable);
    }
    if (instr === 'time') {
      return String(Math.round(new Date().getTime() / 1000));
    }
    if (instr === 'range') {
      let start = 32;
      let end = 126;
      if (params.length === 1) {
        end = utils.parseNum(params[0]);
      }
      if (params.length === 2) {
        start = utils.parseNum(params[0]);
        end = utils.parseNum(params[1]);
      }
      let str = '';
      for (let i = start; i <= end; i++) {
        str += String.fromCharCode(i);
      }
      return str;
    }
    throw new UnknownInstruction(instr, 'send');
  }

  run(paramString) {
    const parsed = parseParticles(paramString);
    const processed = parsed.map(particle => {
      const [instruction, ...args] = particle;
      return this._process(instruction, args);
    });
    const msg = processed.join('');

    if (this._dwst.connection === null || this._dwst.connection.isClosing() || this._dwst.connection.isClosed()) {
      throw new NoConnection(msg);
    }
    this._dwst.ui.terminal.log(msg, 'sent');
    this._dwst.connection.send(msg);
  }
}

