
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../lib/utils.js';

export default class PromptHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  async runPlugin(pluginName, paramString) {
    const plugin = this._dwst.model.plugins.getPlugin(pluginName);
    if (plugin === null) {
      throw new this._dwst.types.errors.UnknownCommand(pluginName);
    }
    return plugin.run(paramString);
  }

  run(command) {
    const [pluginName, ...params] = command.split(' ');
    const paramString = params.join(' ');
    this.runPlugin(pluginName, paramString).catch(error => {
      utils.globalThrow(error);
    });
  }

  silent(line) {
    const noslash = line.substring(1);
    this.run(noslash);
  }

  loud(line) {
    this._dwst.ui.terminal.log(line, 'command');
    this.silent(line);
  }
}
