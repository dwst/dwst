
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class File extends DwstFunction {

  constructor(dwst) {
    super();
    this._dwst = dwst;
  }

  commands() {
    return ['file'];
  }

  usage() {
    return [
      'file()',
    ];
  }

  examples() {
    return [
      '/s ${file()}',
      '/b ${file()}',
      '/set foo ${file()}',
    ];
  }

  info() {
    return 'read file from filesystem';
  }

  _readFile() {
    return new Promise(resolve => {
      this._dwst.ui.fileInput.read(file => {
        const reader = new FileReader();
        reader.addEventListener('load', evt => {
          const buffer = evt.target.result;
          resolve(buffer);
        });
        reader.readAsArrayBuffer(file);
      });
    });
  }

  async run() {
    const fileContents = await this._readFile();
    return new Uint8Array(fileContents);
  }
}
