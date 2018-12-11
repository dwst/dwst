
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

function joinBuffers(buffersToJoin) {
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
  return out.buffer;
}

export default class Binary {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['binary', 'b'];
  }

  usage() {
    return [
      '/binary [template]',
      '/b [template]',
    ];
  }

  examples() {
    return [
      '/binary Hello world!',
      '/binary ["JSON","is","cool"]',
      '/binary multiline\\r\\nmessage',
      '/binary null terminated string\\0one more\\0',
      '/binary tab\\x09separated\\x09strings',
      '/binary \\x{68656c6c6f 2c20 776f726c64}',
      '/b Available now with ~71.43% less typing!',
    ];
  }

  info() {
    return 'send binary data';
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
      if (textOrBinary.constructor === Uint8Array) {
        return textOrBinary;
      }
      const binary = new TextEncoder().encode(textOrBinary);
      return binary;
    });
    const out = joinBuffers(processed);

    const msg = `<${out.byteLength}B of data> `;
    const connection = this._dwst.model.connection;
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      throw new this._dwst.lib.errors.NoConnection(msg);
    }
    this._dwst.ui.terminal.blog(out, 'sent');
    this._dwst.model.connection.send(out);
  }
}

