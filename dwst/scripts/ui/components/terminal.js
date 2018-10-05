
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import renderLogEntry from '../renderers/log_entry.js';
import renderGfx from '../renderers/gfx.js';

export default class Terminal {

  constructor(element, dwst) {
    this._element = element;
    this._dwst = dwst;
    this._limit = 1000;
  }

  reset() {
    this._element.innerHTML = '';
  }

  _addLogItem(logLine) {
    const userWasScrolling = this._dwst.ui.screen.isUserScrolling();
    this._element.appendChild(logLine);
    while (this._element.childElementCount > this._limit) {
      this._element.removeChild(this._element.firstChild);
    }
    if (userWasScrolling) {
      return;
    }
    this._dwst.ui.screen.scrollLog();
  }

  clearLog() {
    const logClear = document.createElement('div');
    logClear.setAttribute('class', 'dwst-log__clear');
    this._addLogItem(logClear);
  }

  gfx(lines, colors) {
    const gfx = renderGfx(lines, colors);

    const item = document.createElement('div');
    item.setAttribute('class', 'dwst-log__item dwst-log__item--gfx');
    item.appendChild(gfx);

    this._addLogItem(item);
    this._dwst.ui.updateGfxPositions();
  }

  mlog(mlogDescription, type) {

    const logLine = renderLogEntry(mlogDescription, type, this._dwst.controller.link);

    const item = document.createElement('div');
    item.setAttribute('class', `dwst-log__item dwst-log__item--${type}`);
    item.appendChild(logLine);

    this._addLogItem(item);
  }

  log(line, type) {
    this.mlog([line], type);
  }

  _hexdump(buffer) {
    function hexify(num) {
      const hex = num.toString(16);
      if (hex.length < 2) {
        return `0${hex}`;
      }
      return hex;
    }
    function charify(num) {
      if (num > 0x7e || num < 0x20) { // non-printable
        return '.';
      }
      return String.fromCharCode(num);
    }
    const dv = new DataView(buffer);
    let offset = 0;
    const lines = [];
    while (offset < buffer.byteLength) {
      let text = '';
      const hexes = [];
      for (let i = 0; i < 16; i++) {
        if (offset < buffer.byteLength) {
          const oneByte = dv.getUint8(offset);
          const asChar = charify(oneByte);
          const asHex = hexify(oneByte);
          text += asChar;
          hexes.push(asHex);
        }
        offset += 1;
      }
      lines.push({
        text,
        hexes,
      });

    }
    return lines;
  }

  blog(buffer, type) {
    const msg = `<${buffer.byteLength}B of binary data>`;
    const hd = this._hexdump(buffer);
    const hexLines = hd.map(line => {
      return {
        type: 'hexline',
        text: line.text,
        hexes: line.hexes,
      };
    });
    this.mlog([msg].concat(hexLines), type);
  }
}
