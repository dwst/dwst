
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

function commandsList(commands) {
  const available = [];
  commands.sort().forEach(c => {
    if (c.length > 1) {
      const commandSegment = {
        type: 'dwstgg',
        text: c,
        section: c,
        spacing: true,
        wrap: false,
      };
      available.push(commandSegment);
    }
  });
  return [flatList(available)];
}

export default function commandsPage(commands) {

  const listing = commandsList(commands);

  return ([
    {
      type: 'h1',
      text: 'Alphabetical List of Commands',
    },
    '',
  ]).concat(listing).concat([
    [
      'Type ',
      {
        type: 'syntax',
        text: '/help <command>',
      },
      ' for usage',
    ],
    '',
  ]);
}
