
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function currenttime() {
  const addzero = function (i) {
    if (i < 10) {
      return `0${i}`;
    }
    return String(i);
  };
  const date = new Date();
  const time = `${addzero(date.getHours())}:${addzero(date.getMinutes())}<span class="sec">:${addzero(date.getSeconds())}</span>`;
  return time;

}

