
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Plugins {

  constructor(dwst) {
    this._commands = new Map();
    this._dwst = dwst;
  }

  setPlugins(pluginClasses) {
    this._commands.clear();
    for (const Constructor of pluginClasses) {
      const plugin = new Constructor(this._dwst);
      for (const command of plugin.commands()) {
        this._commands.set(command, plugin);
      }
    }
  }

  getPlugin(pluginName) {
    const plugin = this._commands.get(pluginName);
    if (typeof plugin === 'undefined') {
      return null;
    }
    return plugin;
  }

  getNames() {
    return [...this._commands.keys()];
  }
}
