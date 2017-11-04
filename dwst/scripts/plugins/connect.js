
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';
import Connection from '../connection.js';

export default class Connect {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['connect'];
  }

  usage() {
    return [
      '/connect <ws-url> [p1[,p2[,...]]]',
    ];
  }

  examples() {
    return [
      '/connect wss://echo.websocket.org/',
      '/connect ws://echo.websocket.org/',
      '/connect ws://127.0.0.1:1234/ protocol1.example.com,protocol2.example.com',
    ];
  }

  info() {
    return 'connect to a server';
  }

  _run(url, protocolString = '') {
    if (this._dwst.connection !== null) {
      this._dwst.terminal.mlog([
        'Already connected to a server',
        [
          'Type ',
          {
            type: 'command',
            text: '/disconnect',
          },
          ' to end the connection',
        ],
      ], 'error');
      return;
    }
    const protoCandidates = (() => {
      if (protocolString === '') {
        return [];
      }
      return protocolString.split(',');
    })();
    const protocols = protoCandidates.filter(protocolName => {

      // https://tools.ietf.org/html/rfc6455#page-17

      const basicAlphabet = utils.range(0x21, 0x7e).map(charCode => String.fromCharCode(charCode));
      const httpSeparators = new Set([...'()<>@,;:\\"/[]?={} \t']);
      const validProtocolChars = new Set(basicAlphabet.filter(character => !httpSeparators.has(character)));
      const usedChars = [...protocolName];
      const invalidCharsSet = new Set(usedChars.filter(character => !validProtocolChars.has(character)));
      const invalidChars = [...invalidCharsSet];
      if (invalidChars.length > 0) {
        const invalidCharsString = invalidChars.map(character => `"${character}"`).join(', ');
        this._dwst.terminal.mlog([`Skipped invalid protocol candidate "${protocolName}".`, `The following characters are not allowed: ${invalidCharsString}`], 'warning');
        return false;
      }
      return true;
    });
    if (self.origin.startsWith('https://') && url.startsWith('ws://')) {
      const secureUrl = `wss://${url.slice('ws://'.length)}`;
      this._dwst.terminal.mlog([
        [
          'Attempting unprotected connection from a secure origin. ',
          'See ',
          {
            type: 'dwstgg',
            text: '#unprotected',
            section: '#unprotected',
          },
          ' for details. Consider using ',
          {
            type: 'command',
            text: `/connect ${secureUrl} ${protocolString}`,
          },
        ],
      ], 'warning');
    }
    this._dwst.connection = new Connection(url, protocols, this._dwst.controller);
    const protoFormatted = protocols.join(', ');
    const negotiation = (() => {
      if (protocols.length < 1) {
        return ['No protocol negotiation.'];
      }
      return [`Accepted protocols: ${protoFormatted}`];
    })();
    this._dwst.terminal.mlog([`Connecting to ${this._dwst.connection.url}`].concat(negotiation), 'system');
  }

  run(paramString) {
    if (paramString.length < 1) {
      this._run();
      return;
    }
    const params = paramString.split(' ');
    this._run(...params);
  }
}
