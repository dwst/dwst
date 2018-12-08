
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

function flatList(values) {
  const segments = [];
  values.forEach(value => {
    value.afterText = ',';
    segments.push(value);
    segments.push(' ');
  });
  segments.pop();  // remove extra space
  const last = segments.pop();
  Reflect.deleteProperty(last, 'afterText');
  segments.push(last);
  return segments;
}

export default function sectionList(sections) {
  const available = [];
  sections.sort().forEach(sec => {
    if (sec.length > 1) {
      const sectionSegment = {
        type: 'dwstgg',
        text: sec,
        section: sec,
        spacing: true,
        wrap: false,
      };
      available.push(sectionSegment);
    }
  });
  return [flatList(available)];
}
