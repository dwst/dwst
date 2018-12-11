
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import parseControlChars from '../lib/control.js';

function partToMlog(part) {
  const text = (() => {
    if (part.nice !== null) {
      return part.nice;
    }
    const charCode = part.chr.charCodeAt(0);
    if (charCode < 0x80) {
      const charHex = `0${charCode.toString(16)}`.slice(-2);
      return `\\x${charHex}`;
    }
    return `\\u{${charCode.toString(16)}}`;
  })();
  const title = `${text} - ${part.name} (${part.abbr})`;
  return {
    type: 'control',
    text,
    title,
  };
}

function createLines(mlogItems) {
  const CR = '\\r';
  const LF = '\\n';
  const lines = [];
  let line = [];
  let previous = null;
  for (const part of mlogItems) {
    if (previous === null) {
      line.push(part);
      if (typeof part === 'object') {
        if (part.text === CR) {
          previous = CR;
        }
        if (part.text === LF) {
          previous = LF;
        }
      }
    } else if (previous === CR) {
      if (typeof part === 'string') {
        lines.push(line);
        line = [];
        line.push(part);
        previous = null;
      } else  if (part.text === CR) {
        lines.push(line);
        line = [];
        line.push(part);
        previous = CR;
      } else if (part.text === LF) {
        line.push(part);
        lines.push(line);
        line = [];
        previous = null;
      } else {
        lines.push(line);
        line = [];
        line.push(part);
        previous = null;
      }
    } else if (previous === LF) {
      if (typeof part === 'string') {
        lines.push(line);
        line = [];
        line.push(part);
        previous = null;
      } else  if (part.text === CR) {
        line.push(part);
        lines.push(line);
        line = [];
        previous = null;
      } else if (part.text === LF) {
        lines.push(line);
        line = [];
        line.push(part);
        previous = LF;
      } else {
        lines.push(line);
        line = [];
        line.push(part);
        previous = null;
      }
    }
  }
  lines.push(line);
  return lines;
}

function hilightControlChars(msg) {
  const parts = parseControlChars(msg);
  const mlogItems = parts.map(part => {
    if (typeof part === 'object') {
      return partToMlog(part);
    }
    return part;
  });
  const lines = createLines(mlogItems);
  return lines;
}

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
      this._dwst.ui.terminal.mlog(hilightControlChars(msg), 'received');
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

  beforeSendWhileConnecting(verb) {
    this._dwst.ui.terminal.log(`Attempting to send data while ${verb}`, 'warning');
  }

  onSend(msg) {
    if (typeof msg === 'string') {
      this._dwst.ui.terminal.mlog(hilightControlChars(msg), 'sent');
    } else {
      this._dwst.ui.terminal.blog(msg, 'sent');
    }
  }
}
