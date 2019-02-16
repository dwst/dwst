
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class FakeSocket {
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
