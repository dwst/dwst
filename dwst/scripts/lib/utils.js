
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default {

  parseNum: str => {
    if (str.length > 2 && str.substr(0, 2) === '0x') {
      return parseInt(str.substr(2), 16);
    }
    const num = parseInt(str, 10);
    return num;
  },

  chunkify: (l, n) => {
    const chunks = [];
    let chunk = [];
    let i = 0;
    for (const b of l) {
      if (i >= n) {
        chunks.push(chunk);
        chunk = [];
        i = 0;
      }
      chunk.push(b);
      i += 1;
    }
    chunks.push(chunk);
    return chunks;
  },

  range: (a, b = null) => {
    let start;
    let stop;
    if (b === null) {
      start = 0;
      stop = a;
    } else {
      start = a;
      stop = b;
    }
    const length = stop - start;
    return Array(length).fill().map((_, i) => start + i);
  },

  htmlescape: text => {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

};
