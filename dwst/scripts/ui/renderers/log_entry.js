
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import renderTime from './time.js';
import renderDirection from './direction.js';
import renderMlog from './mlog.js';

export default function renderLogEntry(mlog, type, linkHandlers) {
  const time = renderTime();
  const direction = renderDirection(type);
  const content = renderMlog(mlog, type, linkHandlers);

  const logEntry = document.createElement('span');
  logEntry.setAttribute('class', 'dwst-log-entry');

  const timeCell = document.createElement('span');
  timeCell.setAttribute('class', 'dwst-log-entry__time');
  timeCell.appendChild(time);

  const directionCell = document.createElement('span');
  directionCell.setAttribute('class', 'dwst-log-entry__direction');
  directionCell.appendChild(direction);

  const contentCell = document.createElement('span');
  contentCell.setAttribute('class', 'dwst-log-entry__content');
  contentCell.appendChild(content);

  logEntry.appendChild(timeCell);
  logEntry.appendChild(directionCell);
  logEntry.appendChild(contentCell);

  return logEntry;
}


