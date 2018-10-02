
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Screen {

  constructor(element, dwst) {
    this._element = element;
    this._dwst = dwst;
  }

  isUserScrolling() {
    const errorMargin = 1;
    // Some device pixel ratios create problems when errorMargin < 1.
    // Try to use Windows 10 with 125%, 175% and 225% scaling.
    const contentHeight = this._element.scrollHeight;
    const visible = this._element.offsetHeight;
    const invisible = contentHeight - visible;
    const invisibleAbove = this._element.scrollTop;
    const invisibleBelow = invisible - invisibleAbove;
    return invisibleBelow > errorMargin;
  }

  scrollLog() {
    this._element.scrollTop = this._element.scrollHeight;
    this._dwst.ui.scrollNotification.hideScrollNotification();
  }

}
