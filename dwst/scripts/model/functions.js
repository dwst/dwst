
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Functions {

  constructor(dwst, functionClasses) {
    this._commands = new Map();
    for (const Constructor of functionClasses) {
      const func = new Constructor(dwst);
      for (const name of func.commands()) {
        this._commands.set(name, func);
      }
    }
  }

  getFunction(functionName) {
    const func = this._commands.get(functionName);
    if (typeof func === 'undefined') {
      return null;
    }
    return func;
  }

  getNames() {
    return [...this._commands.keys()];
  }
}
