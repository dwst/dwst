
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Loadbin {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['loadbin'];
  }

  usage() {
    return [
      '/loadbin [variable]',
    ];
  }

  examples() {
    return [
      '/loadbin',
      '/loadbin default',
    ];
  }

  info() {
    return 'load binary data from a file';
  }

  _run(variable = 'default') {
    this._dwst.ui.fileInput.read(file => {
      const reader = new FileReader();
      reader.addEventListener('load', evt => {
        const buffer = evt.target.result;
        this._dwst.model.bins.set(variable, buffer);
        this._dwst.ui.terminal.log(`Binary file ${file.name} (${buffer.byteLength}B) loaded to "${variable}"`, 'system');
      });
      reader.readAsArrayBuffer(file);
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
