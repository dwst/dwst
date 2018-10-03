
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class FileInput {

  constructor(element, dwst) {
    this._element = element;
    this._dwst = dwst;
  }

  read(callback) {
    const upload = this._element.getElementsByTagName('input')[0];
    upload.onchange = () => {
      const file = upload.files[0];
      this._element.innerHTML = this._element.innerHTML;
      callback(file);
    };
    upload.click();
  }
}
