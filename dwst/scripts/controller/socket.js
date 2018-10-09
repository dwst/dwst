
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class SocketHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  onConnectionOpen(protocol) {
    const selected = (() => {
      if (protocol.length < 1) {
        return [];
      }
      return [`Selected protocol: ${protocol}`];
    })();
    this._dwst.ui.terminal.mlog(['Connection established.'].concat(selected), 'system');
    this._dwst.ui.menuButton.connected(true);
  }

  onConnectionClose(e, sessionLength) {
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
    const sessionLengthString = (() => {
      if (sessionLength === null) {
        return [];
      }
      return [`Session length: ${sessionLength}ms`];
    })();
    this._dwst.ui.terminal.mlog(['Connection closed.', `Close status: ${code}`].concat(reason).concat(sessionLengthString), 'system');
    this._dwst.model.connection = null;
    this._dwst.ui.menuButton.connected(false);
  }

  onMessage(msg) {
    if (typeof msg === 'string') {
      this._dwst.ui.terminal.log(msg, 'received');
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

  onSendWhileConnecting(verb) {
    this._dwst.ui.terminal.log(`Attempting to send data while ${verb}`, 'warning');
  }
}
