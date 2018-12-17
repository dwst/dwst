
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Binary {

  constructor(dwst) {
    this._dwst = dwst;
    this.functionSupport = true;
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
      '/binary unicode snowman \\u2603',
      '/binary unicode tea cup \\u{1f375}',
      '/b Available now with ~71.43% less typing!',
    ];
  }

  info() {
    return 'send binary data';
  }

  run(buffer) {
    const msg = `<${buffer.byteLength}B of data> `;
    const connection = this._dwst.model.connection;
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      throw new this._dwst.lib.errors.NoConnection(msg);
    }
    this._dwst.model.connection.send(buffer);
  }
}

