
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

class FakeSocket {
  constructor(url) {
    this.url = url;
    this.protocol = '';
    this.readyState = 1;
    this._path = url.split('//').pop();
    this._nextFlood = null;
    window.setTimeout(() => {
      this.onopen();
      if (this._path === 'flood') {
        this._flood(0);
      }
    }, 0);
  }

  _flood(count) {
    this._nextFlood = window.setTimeout(() => {
      this.onmessage({
        data: `${count}`,
      });
      this._flood(count + 1);
    }, 0);
  }

  send(message) {
    if (this._path === 'echo') {
      const data = (() => {
        if (typeof message === 'string') {
          return message;
        }
        if (message instanceof ArrayBuffer) {
          return new Blob([new Uint8Array(message)]);
        }
        throw new Error('Unexpected message type');
      })();
      window.setTimeout(() => {
        this.onmessage({
          data,
        });
      }, 0);
    }
  }

  close() {
    window.clearTimeout(this._nextFlood);
    this.readyState = 3;
    this.onclose({
      code: 1000,
      reason: '',
    });
  }
}

export default class Connection {

  constructor(url, protocols = [], controller) {
    this._controller = controller;
    this.sessionStartTime = null;
    this.ws = (() => {
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
    this.ws.onopen = this._onopen.bind(this);
    this.ws.onclose = this._onclose.bind(this);
    this.ws.onmessage = this._onmessage.bind(this);
    this.ws.onerror = this._onerror.bind(this);
  }

  _onopen() {
    this.sessionStartTime = (new Date()).getTime();
    this._controller.onConnectionOpen(this.ws.protocol);
  }

  _onclose(e) {
    const sessionLength = (() => {
      if (this.sessionStartTime === null) {
        return null;
      }
      const currentTime = (new Date()).getTime();
      return currentTime - this.sessionStartTime;
    })();
    this._controller.onConnectionClose(e, sessionLength);
  }

  _onmessage(msg) {
    this._controller.onMessage(msg.data);
  }

  _onerror() {
    this._controller.onError();
  }

  get url() {
    return this.ws.url;
  }

  get verb() {
    const readyState = this.ws.readyState;
    if (readyState === 0) {
      return 'connecting';
    }
    if (readyState === 1) {
      return 'connected';
    }
    if (readyState === 2) {
      return 'closing connection';
    }
    if (readyState === 3) {
      return 'hanging on an already closed connection';
    }
    throw new Error('Unkown readyState');
  }

  get protocol() {
    return this.ws.protocol;
  }

  send(...params) {
    if (this.ws.readyState !== 1) {
      this._controller.beforeSendWhileConnecting(this.verb);
    }
    this._controller.onSend(...params);
    this.ws.send(...params);
  }

  close() {
    this.ws.close();
  }

  isConnecting() {
    return this.ws.readyState === 0;
  }

  isOpen() {
    return this.ws.readyState === 1;
  }

  isClosing() {
    return this.ws.readyState === 2;
  }

  isClosed() {
    return this.ws.readyState === 3;
  }

}
