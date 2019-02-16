
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class SocketHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  onOpen() {
    const socket = this._dwst.model.connection.getSocket();
    socket.resetClock();
    const selected = (() => {
      if (socket.protocol.length < 1) {
        return [];
      }
      return [`Selected protocol: ${socket.protocol}`];
    })();
    this._dwst.ui.terminal.mlog(['Connection established.'].concat(selected), 'system');
    this._dwst.ui.menuButton.connected(true);
  }

  onClose(e) {
    const meanings = {
      1000: 'Normal Closure',
      1001: 'Going Away',
      1002: 'Protocol error',
      1003: 'Unsupported Data',
      1005: 'No Status Rcvd',
      1006: 'Abnormal Closure',
      1007: 'Invalid frame payload data',
      1008: 'Policy Violation',
      1009: 'Message Too Big',
      1010: 'Mandatory Ext.',
      1011: 'Internal Server Error',
      1015: 'TLS handshake',
    };
    const code = (() => {
      if (meanings.hasOwnProperty(e.code)) {
        return `${e.code} (${meanings[e.code]})`;
      }
      return `${e.code}`;
    })();
    const reason = (() => {
      if (e.reason.length < 1) {
        return [];
      }
      return [`Close reason: ${e.reason}`];
    })();
    const socket = this._dwst.model.connection.getSocket();
    const sessionLengthString = (() => {
      if (socket.sessionLength === null) {
        return [];
      }
      return [`Session length: ${socket.sessionLength}ms`];
    })();
    const ws = socket.getRawSocket();
    ws.onopen = null;
    ws.onclose = null;
    ws.onmessage = null;
    ws.onerror = null;
    this._dwst.model.connection.clearSocket();
    this._dwst.ui.terminal.mlog(['Connection closed.', `Close status: ${code}`].concat(reason).concat(sessionLengthString), 'system');
    this._dwst.ui.menuButton.connected(false);
  }

  onMessage(msg2) {
    const msg = msg2.data;
    if (typeof msg === 'string') {
      this._dwst.ui.terminal.tlog(msg, 'received');
    } else {
      const fr = new FileReader();
      fr.addEventListener('load', evt => {
        const buffer = evt.target.result;
        this._dwst.ui.terminal.blog(buffer, 'received');
      });
      fr.readAsArrayBuffer(msg);
    }
  }

  onError() {
    this._dwst.ui.terminal.log('WebSocket error.', 'error');
  }
}
