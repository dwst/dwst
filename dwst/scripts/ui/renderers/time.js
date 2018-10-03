
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function renderTime(contentOnly = false) {
  const addzero = function (i) {
    if (i < 10) {
      return `0${i}`;
    }
    return String(i);
  };
  const date = new Date();
  const content = `${addzero(date.getHours())}:${addzero(date.getMinutes())}<span class="dwst-time__sec">:${addzero(date.getSeconds())}</span>`;

  if (contentOnly) {
    return content;
  }

  const time = document.createElement('span');
  time.setAttribute('class', 'dwst-time');
  time.innerHTML = content;

  return time;

}

