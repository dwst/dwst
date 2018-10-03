
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class SendButton {

  constructor(element, dwst) {
    this._element = element;
    this._dwst = dwst;
  }

  init() {
    this._element.addEventListener('click', () => {
      this._dwst.ui.prompt.send();
    });
  }
}
