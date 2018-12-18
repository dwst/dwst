
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import renderLogEntry from '../renderers/log_entry.js';
import renderGfx from '../renderers/gfx.js';

import parseControlChars from '../../lib/control.js';

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

  mlog(mlogDescription, type, options = {textData: false}) {

    const logLine = renderLogEntry(mlogDescription, type, this._dwst.controller.link, options);

    const item = document.createElement('div');
    item.setAttribute('class', `dwst-log__item dwst-log__item--${type}`);
    item.appendChild(logLine);

    this._addLogItem(item);
  }

  log(line, type) {
    this.mlog([line], type);
  }

  blog(buffer, type) {
    this.mlog([
      `<${buffer.byteLength}B of binary data>`,
      buffer,
    ], type);
  }

  tlog(msg, type) {
    const mlogDescription = hilightControlChars(msg);
    this.mlog(mlogDescription, type, {textData: true});
  }
}
