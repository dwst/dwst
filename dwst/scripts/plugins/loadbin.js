
/**

  Authors: Toni Ruottu, Finland 2010-2017

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

  run(variable = 'default') {
    const upload = document.getElementById('file1');
    upload.onchange = () => {
      const file = upload.files[0];
      const ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      const reader = new FileReader();
      reader.onload = function (e2) {
        const buffer = e2.target.result;
        this._dwst.bins.set(variable, buffer);
        this._dwst.terminal.log(`Binary file ${file.fileName} (${buffer.byteLength}B) loaded to "${variable}"`, 'system');
      };
      reader.readAsArrayBuffer(file);
    };
    upload.click();
  }
}


