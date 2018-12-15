
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Variables {

  constructor(dwst, functionClasses) {
    this._functions = new Map();
    this._variables = new Map();
    for (const Constructor of functionClasses) {
      const func = new Constructor(dwst);
      for (const name of func.commands()) {
        this._functions.set(name, func);
      }
    }
  }

  setVariable(variableName, value) {
    this._variables.set(variableName, value);
  }

  getVariable(variableName) {
    const variable = this._variables.get(variableName);
    if (typeof variable !== 'undefined') {
      return variable;
    }
    return this.getFunction(variableName);
  }

  getVariableNames() {
    return [...this._variables.keys()];
  }

  getFunction(functionName) {
    // returns function even when it's variable had been deleted/overwritten
    const func = this._functions.get(functionName);
    if (typeof func !== 'undefined') {
      return func;
    }
    return null;
  }

  getFunctionNames() {
    return [...this._functions.keys()];
  }
}
