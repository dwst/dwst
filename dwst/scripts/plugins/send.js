
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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
      '/send ["JSON","is","cool"]',
      '/send multiline\\r\\nmessage',
      '/send null terminated string\\0one more\\0',
      '/send tab\\x09separated\\x09strings',
      '/send \\x{68656c6c6f 2c20 776f726c64}',
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
    const func = this._dwst.functions.getFunction(instr);
    if (func === null) {
      throw new this._dwst.lib.errors.UnknownInstruction(instr);
    }
    return func.run(params);
  }

  run(paramString) {
    const parsed = this._dwst.lib.particles.parseParticles(paramString);
    const processed = parsed.map(particle => {
      const [instruction, ...args] = particle;
      const textOrBinary = this._process(instruction, args);
      if (typeof textOrBinary === 'string') {
        return textOrBinary;
      }
      const text = new TextDecoder('utf-8').decode(textOrBinary, {fatal: true});
      return text;
    });
    const msg = processed.join('');

    const connection = this._dwst.model.connection;
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      throw new this._dwst.lib.errors.NoConnection(msg);
    }
    this._dwst.ui.terminal.log(msg, 'sent');
    this._dwst.model.connection.send(msg);
  }
}

