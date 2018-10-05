
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class PromptHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  run(command) {
    const [pluginName, ...params] = command.split(' ');
    const paramString = params.join(' ');

    const plugin = this._dwst.plugins.getPlugin(pluginName);
    if (plugin === null) {
      const errorMessage = `invalid command: ${pluginName}`;
      const helpTip = [
        'type ',
        {
          type: 'command',
          text: '/help',
        },
        ' to list available commands',
      ];
      this._dwst.ui.terminal.mlog([errorMessage, helpTip], 'error');
      return;
    }
    plugin.run(paramString);
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
