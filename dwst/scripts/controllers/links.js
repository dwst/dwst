
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class LinkHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  onHelpLinkClick(command) {
    this._dwst.controller.prompt.loud(command);
  }

  onCommandLinkClick(command) {
    this._dwst.model.history.select(command);
    this._dwst.controller.prompt.loud(command);
  }
}
