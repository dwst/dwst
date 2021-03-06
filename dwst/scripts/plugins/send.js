
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Send {

  constructor(dwst) {
    this._dwst = dwst;
    this._encoder = new TextDecoder('utf-8', {fatal: true});
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
        throw new this._dwst.types.errors.InvalidUtf8(buffer);
      }
      throw e;
    }
  }

  async run(templateExpression) {
    const buffer = await this._dwst.controller.template.eval(templateExpression);
    const msg = this._encode(buffer);
    this._dwst.controller.connection.send(msg);
  }
}

