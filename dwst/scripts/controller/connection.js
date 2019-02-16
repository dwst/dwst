
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import FakeSocket from '../simulator/socket.js';

export default class ConnectionHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  connect(url, protocols) {
    if (this._dwst.model.connection.getSocket() !== null) {
      throw new this._dwst.types.errors.AlreadyConnected();
    }
    const ws = (() => {
      const SocketConstructor = (() => {
        if (url.startsWith('dwst://')) {
          return FakeSocket;
        }
        return WebSocket;
      })();
      if (protocols.length < 1) {
        return new SocketConstructor(url);
      }
      return new SocketConstructor(url, protocols);
    })();
    const controller = this._dwst.controller.socket;
    ws.onopen = controller.onOpen.bind(controller);
    ws.onclose = controller.onClose.bind(controller);
    ws.onmessage = controller.onMessage.bind(controller);
    ws.onerror = controller.onError.bind(controller);
    this._dwst.model.connection.createSocket(ws);
  }

  tear() {
    const socket = this._dwst.model.connection.getSocket();
    const ws = socket.getRawSocket();
    ws.close();
  }

  send(buffer) {
    const socket = this._dwst.model.connection.getSocket();
    if (socket === null || socket.isClosing() || socket.isClosed()) {
      let msg;
      if (typeof foo === 'string') {
        msg = buffer;
      } else {
        msg = `<${buffer.byteLength}B of data> `;
      }
      throw new this._dwst.types.errors.NoConnection(msg);
    }
    if (socket.verb !== 'connected') {
      this._dwst.ui.terminal.log(`Attempting to send data while ${socket.verb}`, 'warning');
    }
    if (typeof buffer === 'string') {
      this._dwst.ui.terminal.tlog(buffer, 'sent');
    } else {
      this._dwst.ui.terminal.blog(buffer, 'sent');
    }
    socket.getRawSocket().send(buffer);
  }
}
