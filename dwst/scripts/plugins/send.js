
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
    this._encoder = new TextDecoder('utf-8', {fatal: true});
    this.functionSupport = true;
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
      '/send unicode snowman \\u2603',
      '/send unicode tea cup \\u{1f375}',
      '/s Available now with 60% less typing!',
    ];
  }

  info() {
    return 'send textual data';
  }

  _encode(buffer) {
    try {
      const text = new TextDecoder('utf-8', {fatal: true}).decode(buffer);
      return text;
    } catch (e) {
      if (e instanceof TypeError) {
        throw new this._dwst.lib.errors.InvalidUtf8(buffer);
      }
      throw e;
    }
  }

  run(buffer) {
    const msg = this._encode(buffer);
    const connection = this._dwst.model.connection;
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      throw new this._dwst.lib.errors.NoConnection(msg);
    }
    this._dwst.model.connection.send(msg);
  }
}

