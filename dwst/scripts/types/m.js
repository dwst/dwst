/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST markup language

function *roundrobin(...iterators) {
  while (true) {
    const results = iterators.map(i => i.next());
    for (const r of results) {
      if (typeof r.value !== 'undefined') {
        yield r.value;
      }
    }
    if (results.every(r => r.done)) {
      return;
    }
  }
}

function roundrobinMerge(a, b) {
  const ia = a[Symbol.iterator]();
  const ib = b[Symbol.iterator]();
  return [...roundrobin(ia, ib)];
}

function arrayJoin([x, ...xs], delimiter) {
  return [x].concat(xs.flatMap(item => [delimiter, item]));
}

export default {
  line: (text, ...vars) => roundrobinMerge(text, vars),
  paragraph: (...lines) => arrayJoin(lines, ' ').flat(),
  help: (text, section = text, warning = false) => ({type: 'help', text, section, warning}),
  command: text => ({type: 'command', text}),
  strong: text => ({type: 'strong', text}),
  code: text => ({type: 'code', text}),
  h1: text => ({type: 'h1', text}),
  h2: text => ({type: 'h2', text}),
  syntax: text => ({type: 'syntax', text}),
  link: (url, text = url) => ({type: 'link', text, url}),
  regular: (text, unsafe = false) => ({type: 'regular', text, unsafe}),
};
