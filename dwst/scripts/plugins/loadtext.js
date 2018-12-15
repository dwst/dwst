
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Loadtext {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['loadtext'];
  }

  usage() {
    return [
      '/loadtext [variable] [encoding]',
    ];
  }

  examples() {
    return [
      '/loadtext',
      '/loadtext default',
      '/loadtext default utf-8',
    ];
  }

  info() {
    return 'load text data from a file';
  }

  _run(variable = 'default', encoding) {
    this._dwst.ui.fileInput.read(file => {
      const reader = new FileReader();
      reader.addEventListener('load', evt => {
        const text = evt.target.result;
        this._dwst.model.variables.setVariable(variable, text);
        this._dwst.ui.terminal.log(`Text file ${file.name} (${text.length}B) loaded to "${variable}"`, 'system');
      });
      reader.readAsText(file, encoding);
    });
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

