
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Socket {

  constructor(ws) {
    this._sessionStartTime = null;
    this._ws = ws;
  }

  getRawSocket() {
    return this._ws;
  }

  resetClock() {
    this._sessionStartTime = (new Date()).getTime();
  }

  get sessionLength() {
    if (this._sessionStartTime === null) {
      return null;
    }
    const currentTime = (new Date()).getTime();
    return currentTime - this._sessionStartTime;
  }

  get url() {
    return this._ws.url;
  }

  get verb() {
    const {readyState} = this._ws;
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
    return this._ws.protocol;
  }

  isConnecting() {
    return this._ws.readyState === 0;
  }

  isOpen() {
    return this._ws.readyState === 1;
  }

  isClosing() {
    return this._ws.readyState === 2;
  }

  isClosed() {
    return this._ws.readyState === 3;
  }
}
