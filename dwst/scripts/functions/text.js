
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Text {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['text'];
  }

  usage() {
    return [
      'text(<variable name>)',
    ];
  }

  examples() {
    return [
      '/s ${text(foo)}',
      '/b ${text(foo)}',
    ];
  }

  type() {
    return 'STRING';
  }

  info() {
    return 'read text variable';
  }

  run(params) {
    let variable = 'default';
    if (params.length === 1) {
      variable = params[0];
    }
    return this._dwst.model.texts.get(variable);
  }
}
