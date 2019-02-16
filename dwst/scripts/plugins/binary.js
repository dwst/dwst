
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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
      '/binary unicode snowman \\u2603',
      '/binary unicode tea cup \\u{1f375}',
      '/b Available now with ~71.43% less typing!',
    ];
  }

  info() {
    return 'send binary data';
  }

  async run(templateExpression) {
    const buffer = await this._dwst.controller.template.eval(templateExpression);
    this._dwst.controller.connection.send(buffer);
  }
}
