
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';

export default class Binary {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['binary', 'b'];
  }

  usage() {
    return [
      '/binary [components...]',
      '/b [components...]',
    ];
  }

  examples() {
    return [
      '/binary Hello\\ world!',
      '/binary [random(16)]',
      '/binary [text]',
      '/binary [bin]',
      '/binary \\["JSON","is","cool"]',
      '/binary [range(0,0xff)]',
      '/binary [hex(1234567890abcdef)]',
      '/binary [hex(52)] [random(1)] lol',
      '/b Available\\ now\\ with\\ ~71.43%\\ less\\ typing!',
    ];
  }

  info() {
    return 'send binary data';
  }

  process(instr, params) {
    function byteValue(x) {
      const code = x.charCodeAt(0);
      if (code !== (code & 0xff)) { // eslint-disable-line no-bitwise
        return 0;
      }
      return code;
    }
    function hexpairtobyte(hp) {
      const hex = hp.join('');
      if (hex.length !== 2) {
        return null;
      }
      return parseInt(hex, 16);
    }
    let bytes = [];
    if (instr === 'default') {
      const text = params[0];
      bytes = [...text].map(byteValue);
    }
    if (instr === 'random') {
      const randombyte = () => {
        const out = Math.floor(Math.random() * (0xff + 1));
        return out;
      };
      let num = 16;
      if (params.length === 1) {
        num = utils.parseNum(params[0]);
      }
      bytes = [];
      for (let i = 0; i < num; i++) {
        bytes.push(randombyte());
      }
    }
    if (instr === 'range') {
      let start = 0;
      let end = 0xff;
      if (params.length === 1) {
        end = utils.parseNum(params[0]);
      }
      if (params.length === 2) {
        start = utils.parseNum(params[0]);
        end = utils.parseNum(params[1]);
      }
      bytes = [];
      for (let i = start; i <= end; i++) {
        bytes.push(i);
      }
    }
    if (instr === 'bin') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      let buffer = this._dwst.bins.get(variable);
      if (typeof buffer === 'undefined') {
        buffer = [];
      }
      return new Uint8Array(buffer);
    }
    if (instr === 'text') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      const text = this._dwst.texts.get(variable);
      if (typeof text === 'undefined') {
        bytes = [];
      } else {
        bytes = [...text].map(byteValue);
      }
    }
    if (instr === 'hex') {
      if (params.length === 1) {
        const hex = params[0];
        const nums = hex.split('');
        const pairs = utils.divissimo(nums, 2);
        const tmp = pairs.map(hexpairtobyte);
        bytes = tmp.filter(b => (b !== null));
      } else {
        bytes = [];
      }
    }
    return new Uint8Array(bytes);
  }


  run(...buffers) {
    function joinbufs(buffersToJoin) {

      let total = 0;
      for (const buffer of buffersToJoin) {
        total += buffer.length;
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const buffer of buffersToJoin) {
        out.set(buffer, offset);
        offset += buffer.length;
      }
      return out;
    }
    const out = joinbufs(buffers).buffer;
    const msg = `<${out.byteLength}B of data> `;
    if (this._dwst.connection === null || this._dwst.connection.isClosing() || this._dwst.connection.isClosed()) {
      const connectTip = [
        'Use ',
        {
          type: 'dwstgg',
          text: 'connect',
          section: 'connect',
        },
        ' to form a connection and try again.',
      ];
      this._dwst.terminal.mlog(['No connection.', `Cannot send: ${msg}`, connectTip], 'error');
      return;
    }
    this._dwst.terminal.blog(out, 'sent');
    this._dwst.connection.send(out);
  }
}

