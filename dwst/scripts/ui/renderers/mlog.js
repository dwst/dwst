
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../../lib/utils.js';

function hexdump(buffer) {
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

function hexLines(buffer) {
  const hd = hexdump(buffer);
  return hd.map(line => {
    return {
      type: 'hexline',
      text: line.text,
      hexes: line.hexes,
    };
  });
}

function renderSegment(rawSegment, linkHandlers) {
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
      return utils.htmlescape(rawText);
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
      link.onclick = (evt => {
        evt.preventDefault();
        linkHandlers.onHelpLinkClick(command);
      });
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
      link.onclick = (evt => {
        evt.preventDefault();
        linkHandlers.onCommandLinkClick(command);
      });
      link.setAttribute('href', '#');
      link.setAttribute('title', safeText);
      const textSpan = document.createElement('span');
      textSpan.innerHTML = safeText;
      link.appendChild(textSpan);
      return link;
    }
    if (segment.type === 'hexline') {
      const hexChunks = utils.chunkify(segment.hexes, 4);
      const textChunks = utils.chunkify(rawText, 4);

      const byteGrid = document.createElement('span');
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

        const hexContent = utils.htmlescape(hexChunk.join(' '));
        const hexItem = document.createElement('span');
        hexItem.setAttribute('class', 'dwst-byte-grid__item');
        hexItem.innerHTML = hexContent;
        byteGrid.appendChild(hexItem);

        const textContent = utils.htmlescape(textChunk.join('').padEnd(chunkLength));
        const textItem = document.createElement('span');
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
    if (segment.type === 'control') {
      const textSpan = document.createElement('span');
      textSpan.setAttribute('class', 'dwst-mlog__control');
      textSpan.innerHTML = safeText;
      textSpan.setAttribute('title', segment.title);
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
}

function getLineSegments(line) {
  if (typeof line === 'string') {
    return [line];
  } else if (typeof line === 'object' && !Array.isArray(line)) {
    return [line];
  }
  if (!Array.isArray(line)) {
    throw new Error('error');
  }
  return line;
}

export default function renderMlog(sections, type, linkHandlers) {

  const domSections = sections.map(section => {
    const lines = [];
    if (section instanceof ArrayBuffer) {
      lines.push(...hexLines(section));
    } else {
      lines.push(section);
    }
    const domLines = lines.map(line => {
      const segments = getLineSegments(line);
      const domSegments = segments.map(segment => renderSegment(segment, linkHandlers));
      return domSegments;
    });
    return domLines;
  });
  const outputCell = document.createElement('span');
  outputCell.setAttribute('class', 'dwst-mlog');
  domSections.forEach(domSection => {
    domSection.forEach(domLine => {
      domLine.forEach(domSegment => {
        outputCell.appendChild(domSegment);
      });
      const br = document.createElement('br');
      br.setAttribute('class', 'dwst-mlog__br');
      outputCell.appendChild(br);
    });
  });
  return outputCell;
}
