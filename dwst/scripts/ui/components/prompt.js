
/**

  Authors: Toni Ruottu, Finland 2010-2018
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import parser from '../../lib/parser.js';
const {escapeForTemplateExpression} = parser;

export default class Prompt {

  constructor(element, dwst) {
    this._element = element;
    this._dwst = dwst;
  }

  _enableDebugger() {
    // TODO: refactor debugger to regular plugin
    document.documentElement.classList.add('dwst-debug--guides');
  }

  _showHelpTip() {
    const helpTip = [
      'type ',
      {
        type: 'command',
        text: '/help',
      },
      ' to list available commands',
    ];
    this._dwst.ui.terminal.log(helpTip, 'system');
  }

  send() {
    const raw = this._element.value;
    this._element.value = '';
    this._dwst.model.history.select(raw);
    if (raw === '/idkfa') {
      this._enableDebugger();
      return;
    }
    if (raw.length < 1) {
      this._showHelpTip();
      return;
    }
    if (raw[0] === '/') {
      this._dwst.controller.prompt.loud(raw);
      return;
    }
    const text = escapeForTemplateExpression(raw);
    const command = `/send ${text}`;
    this._dwst.controller.prompt.loud(command);
  }

  _keyHandler(event) {
    if (event.keyCode === 13) {
      this.send();
    } else if (event.keyCode === 38) { // up
      this._element.value = this._dwst.model.history.getPrevious(this._element.value);
      return;
    } else if (event.keyCode === 40) { // down
      this._element.value = this._dwst.model.history.getNext(this._element.value);
      return;
    }
  }

  offerConnect() {
    if (this._element.value === '') {
      const connects = this._dwst.model.history.getConnectCommands(1);
      if (connects.length < 1) {
        this._element.value = `/connect ${this._dwst.model.config.echoServer}`;
      } else {
        this._element.value = connects[0];
      }
    } else {
      this._dwst.model.history.select(this._element.value);
      this._element.value = '';
    }
    this._element.focus();
  }

  init() {
    this._element.addEventListener('keydown', evt => this._keyHandler(evt));
  }

  focus() {
    this._element.focus();
  }
}
