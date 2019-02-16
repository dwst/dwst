
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

const HISTORY_KEY = 'history';

export default class HistoryHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  load() {
    const response = localStorage.getItem(HISTORY_KEY);
    if (response !== null) {
      this._dwst.model.history.setHistory(JSON.parse(response));
    }
  }

  save(history) {
    const saveState = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, saveState);
  }
}
