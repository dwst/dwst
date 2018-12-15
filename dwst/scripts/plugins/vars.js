
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Vars {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['vars'];
  }

  usage() {
    return [
      '/vars',
      '/vars [name]',
    ];
  }

  examples() {
    return [
      '/vars',
      '/vars foo',
    ];
  }

  info() {
    return 'list variables';
  }

  _run(variable = null) {
    if (variable !== null) {
      const v = this._dwst.model.variables.getVariable(variable);
      if (typeof v  === 'string') {
        this._dwst.ui.terminal.log(v, 'system');
        return;
      }
      if (v instanceof ArrayBuffer) {
        this._dwst.ui.terminal.blog(v, 'system');
        return;
      }
      if (v instanceof this._dwst.lib.types.DwstFunction) {
        this._dwst.ui.terminal.blog('<function>', 'system');
        return;
      }
      throw new this._dwst.lib.errors.UnknownVariable(variable);
    }
    const vars = this._dwst.model.variables.getVariableNames();
    if (vars.length === 0) {
      this._dwst.ui.terminal.log('No variables in memory.', 'system');
      return;
    }
    const listing = [...vars].map(name => {
      const value = this._dwst.model.variables.getVariable(name);
      if (typeof value  === 'string') {
        const utf8 = new TextEncoder().encode(value);
        return `${name} <${utf8.byteLength}B of utf-8 text>`;
      }
      if (value instanceof ArrayBuffer) {
        return `${name} <${value.byteLength}B of binary data>`;
      }
      throw new Error('unexpected variable type');
    });
    const strs = ['Loaded vars:'].concat(listing);
    this._dwst.ui.terminal.mlog(strs, 'system');
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

