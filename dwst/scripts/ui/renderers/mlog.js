
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../../utils.js';


export default function renderMlog(lines, type, linkHandlers) {

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
  const outputCell = document.createElement('span');
  outputCell.setAttribute('class', 'dwst-mlog');
  lineElements.forEach(lineElement => {
    lineElement.forEach(segmentElement => {
      outputCell.appendChild(segmentElement);
    });
    const br = document.createElement('br');
    br.setAttribute('class', 'dwst-mlog__br');
    outputCell.appendChild(br);
  });
  return outputCell;
}
