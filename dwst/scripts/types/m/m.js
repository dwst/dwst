/**

  Authors: Toni Ruottu, Finland 2010-2019

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

function paragraph(...lines) {
  return arrayJoin(lines, ' ').flat();
}

function help(text, section = text, userOptions = {}) {
  return {
    warning: false,
    spacing: false,
    wrap: true,
    afterText: null,
    ...userOptions,
    type: 'help',
    text,
    section,
  };
}

function sectionList(sections) {
  const spacing = true;
  const wrap = false;
  const available = sections.sort().map((sec, i, arr) => {
    const lastIndex = arr.length - 1;
    if (i < lastIndex) {
      return help(sec, sec, {spacing, wrap, afterText: ','});
    }
    return help(sec, sec, {spacing, wrap});
  });
  return paragraph(...available);
}

export default {
  h1: text => ({type: 'h1', text}),
  h2: text => ({type: 'h2', text}),
  unsafe: text => ({type: 'regular', text, unsafe: true}),
  regular: text => ({type: 'regular', text}),
  strong: text => ({type: 'strong', text}),
  command: text => ({type: 'command', text}),
  link: (url, text = url) => ({type: 'link', text, url}),
  syntax: text => ({type: 'syntax', text}),
  code: text => ({type: 'code', text}),
  control: (text, title) => ({type: 'control', text, title}),
  hexline: (hexes, text) => ({type: 'hexline', text, hexes}),
  line: (text, ...vars) => roundrobinMerge(text, vars),
  help,
  paragraph,
  sectionList,
};
