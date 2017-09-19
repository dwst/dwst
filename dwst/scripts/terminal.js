
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from './utils.js';
import currenttime from './currenttime.js';

export default class Terminal {

  constructor(elementId, controller) {
    this._elementId = elementId;
    this._controller = controller;
  }

  _htmlescape(line) {
    return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  isUserScrolling() {
    const screen = document.getElementById('screen1');
    return (screen.scrollTop !== (screen.scrollHeight - screen.offsetHeight));
  }

  scrollLog() {
    const screen = document.getElementById('screen1');
    screen.scrollTop = screen.scrollHeight;
    this.hideScrollNotification();
  }

  scrollNotificationUpdate() {
    if (this.isUserScrolling()) {
      this.showScrollNotification();
      return;
    }
    this.hideScrollNotification();
  }

  showScrollNotification() {
    [...document.getElementsByClassName('js-scroll-notification')].forEach(sn => {
      sn.removeAttribute('style');
    });
  }

  hideScrollNotification() {
    [...document.getElementsByClassName('js-scroll-notification')].forEach(sn => {
      sn.setAttribute('style', 'display: none;');
    });
  }

  updateGfxPositions() {
    // Updating gfx positions with this method disables basic centering
    // and aligns the text in the gfx section with the text in log lines.
    const MAX_MAXCHARS = 110;
    Reflect.apply(Array.prototype.forEach, document.getElementsByClassName('dwst-gfx'), [maxDiv => {
      const ref = maxDiv.getElementsByClassName('dwst-gfx__line')[0];
      const refTextWidth = ref.offsetWidth;
      const refTextLength = ref.textContent.length;
      const refWidth = refTextWidth / refTextLength;
      const windowWidth = window.innerWidth;
      const maxFit = Math.floor(windowWidth / refWidth);
      let leftMargin = 0;
      if (maxFit < MAX_MAXCHARS) {
        const invisible = MAX_MAXCHARS - maxFit;
        const invisibleLeft = Math.round(invisible / 2);
        leftMargin -= invisibleLeft;
      }
      const field = maxDiv.getElementsByClassName('dwst-gfx__content')[0];
      field.setAttribute('style', `transform: initial; margin-left: ${leftMargin}ch;`);
    }]);
  }

  addLogLine(logLine) {
    const terminal = document.getElementById(this._elementId);
    const userWasScrolling = this.isUserScrolling();
    terminal.appendChild(logLine);
    if (userWasScrolling) {
      return;
    }
    this.scrollLog();
  }

  clearLog() {
    const logClear = document.createElement('div');
    logClear.setAttribute('class', 'dwst-log__clear');
    this.addLogLine(logClear);
  }

  gfx(lines, colors) {

    const gfxContent = document.createElement('div');
    gfxContent.setAttribute('class', 'dwst-gfx__content');
    lines.forEach((line, li) => {
      const logLine = document.createElement('div');
      logLine.setAttribute('class', 'dwst-gfx__line');
      [...line].forEach((chr, ci) => {
        const color = colors[li][ci];
        const outputCell = document.createElement('span');
        outputCell.setAttribute('class', `dwst-gfx__element dwst-gfx__element--color-${color}`);
        outputCell.innerHTML = chr;
        logLine.appendChild(outputCell);
      });
      gfxContent.appendChild(logLine);
    });

    const gfxContainer = document.createElement('div');
    gfxContainer.setAttribute('class', 'dwst-log__item dwst-log__item--gfx dwst-gfx');
    gfxContainer.setAttribute('aria-hidden', 'true');
    gfxContainer.appendChild(gfxContent);

    this.addLogLine(gfxContainer);

    this.updateGfxPositions();
  }

  mlog(lines, type) {
    const lineElements = lines.map(rawLine => {
      let line;
      if (typeof rawLine === 'string') {
        line = [rawLine];
      } else if (typeof rawLine === 'object' && !Array.isArray(rawLine)) {
        line = [rawLine];
      } else {
        line = rawLine;
      }
      if (!Array.isArray(line)) {
        throw new Error('error');
      }
      const htmlSegments = line.map(rawSegment => {
        let segment;
        if (typeof rawSegment === 'string') {
          segment = {
            type: 'regular',
            text: rawSegment,
          };
        } else {
          segment = rawSegment;
        }
        if (typeof segment === 'object') {
          const rawText = segment.text;
          const safeText = (() => {
            if (segment.hasOwnProperty('unsafe') && segment.unsafe === true) {
              return rawText;
            }
            return this._htmlescape(rawText);
          })();

          if (segment.type === 'regular') {
            const textSpan = document.createElement('span');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'dwstgg') {
            const linkWrapper = document.createElement('span');
            const linkWrapperClasses = ['dwst-mlog__help-link-wrapper'];
            if (segment.wrap === false) {
              linkWrapperClasses.push('dwst-mlog__help-link-wrapper--nowrap');
            }
            linkWrapper.setAttribute('class', linkWrapperClasses.join(' '));
            const link = document.createElement('a');
            const classes = ['dwst-mlog__help-link'];
            if (segment.spacing === true) {
              classes.push('dwst-mlog__help-link--spacing');
            }
            if (segment.warning === true) {
              classes.push('dwst-mlog__help-link--warning');
            }
            link.setAttribute('class', classes.join(' '));
            const command = (() => {
              if (segment.hasOwnProperty('section')) {
                return `/help ${segment.section}`;
              }
              return '/help';
            })();
            link.onclick = () => {
              this._controller.onHelpLinkClick(command);
            };
            link.setAttribute('href', '#');
            link.setAttribute('title', command);
            const textSpan = document.createElement('span');
            textSpan.innerHTML = safeText;
            link.appendChild(textSpan);
            linkWrapper.appendChild(link);
            if (segment.hasOwnProperty('afterText')) {
              const afterTextNode = document.createTextNode(segment.afterText);
              linkWrapper.appendChild(afterTextNode);
            }
            return linkWrapper;
          }
          if (segment.type === 'command') {
            const link = document.createElement('a');
            link.setAttribute('class', 'dwst-mlog__command-link');
            const command = rawText;
            link.onclick = () => {
              this._controller.onCommandLinkClick(command);
            };
            link.setAttribute('href', '#');
            link.setAttribute('title', safeText);
            const textSpan = document.createElement('span');
            textSpan.innerHTML = safeText;
            link.appendChild(textSpan);
            return link;
          }
          if (segment.type === 'hexline') {
            const hexChunks = utils.divissimo(segment.hexes, 4);
            const textChunks = utils.divissimo(rawText, 4);

            const byteGrid = document.createElement('div');
            const byteGridClasses = ['dwst-byte-grid'];
            if (hexChunks.length < 3) {
              byteGridClasses.push('dwst-byte-grid--less-than-three');
            }
            byteGrid.setAttribute('class', byteGridClasses.join(' '));

            const chunksWanted = 4;
            const chunkLength = 4;
            [...Array(chunksWanted).keys()].forEach(i => {
              const [hexChunk = []] = [hexChunks[i]];
              const [textChunk = []] = [textChunks[i]];

              const hexContent = this._htmlescape(hexChunk.join(' '));
              const hexItem = document.createElement('div');
              hexItem.setAttribute('class', 'dwst-byte-grid__item');
              hexItem.innerHTML = hexContent;
              byteGrid.appendChild(hexItem);

              const textContent = this._htmlescape(textChunk.join('').padEnd(chunkLength));
              const textItem = document.createElement('div');
              textItem.setAttribute('class', 'dwst-byte-grid__item');
              textItem.innerHTML = textContent;
              byteGrid.appendChild(textItem);
            });

            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__hexline');
            textSpan.appendChild(byteGrid);
            return textSpan;
          }
          if (segment.type === 'code') {
            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__code');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'strong') {
            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__strong');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'h1') {
            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__h1');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'h2') {
            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__h2');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'syntax') {
            const textSpan = document.createElement('span');
            textSpan.setAttribute('class', 'dwst-mlog__syntax');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
          if (segment.type === 'link') {
            const textSpan = document.createElement('a');
            textSpan.setAttribute('href', segment.url);
            textSpan.setAttribute('target', '_blank');
            textSpan.setAttribute('rel', 'noopener');
            textSpan.setAttribute('class', 'dwst-mlog__link');
            textSpan.innerHTML = safeText;
            return textSpan;
          }
        }
        throw new Error('unknown segment type');
      });
      return htmlSegments;
    });
    const time = currenttime();
    const logLine = document.createElement('div');
    logLine.setAttribute('class', `dwst-log__item dwst-log__item--${type} dwst-log-entry`);
    logLine.innerHTML = `<span class="dwst-log-entry__time dwst-time">${time}</span><span class="dwst-log-entry__direction dwst-direction dwst-direction--${type}">${type}:</span>`;
    const outputCell = document.createElement('span');
    outputCell.setAttribute('class', 'dwst-log-entry__content dwst-mlog');
    lineElements.forEach(lineElement => {
      lineElement.forEach(segmentElement => {
        outputCell.appendChild(segmentElement);
      });
      const br = document.createElement('br');
      br.setAttribute('class', 'dwst-mlog__br');
      outputCell.appendChild(br);
    });
    logLine.appendChild(outputCell);
    this.addLogLine(logLine);
  }

  log(line, type) {
    this.mlog([line], type);
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


