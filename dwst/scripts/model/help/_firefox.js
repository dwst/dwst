
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

const disclaimer = [
  {
    type: 'h2',
    text: '!!! Follow at your own risk !!!',
  },
  '',
  'Disabling security is generally a bad idea and you should only do it if you understand the implications.',
];

export default function firefoxPage() {
  return ([
    {
      type: 'h1',
      text: 'Insecure WebSocket Access in Firefox',
    },
    '',
    [
      'Firefox lets you disable the security feature that prevents you from connecting to ',
      {
        type: 'help',
        text: '#unprotected',
        section: '#unprotected',
      },
      ' WebSockets.',
    ],
    '',
  ]).concat(disclaimer).concat([
    '',
    {
      type: 'h2',
      text: 'Instructions',
    },
    '',
    '1. Go to about:config',
    '2. Search for WebSocket',
    '3. Set allowInsecureFromHTTPS to true',
    '',
  ]);
}
