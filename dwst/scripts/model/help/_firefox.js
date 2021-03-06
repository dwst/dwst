
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

const disclaimer = [
  m.h2('!!! Follow at your own risk !!!'),
  '',
  'Disabling security is generally a bad idea and you should only do it if you understand the implications.',
];

export default function firefoxPage() {
  return ([
    m.h1('Insecure WebSocket Access in Firefox'),
    '',
    m.line`Firefox lets you disable the security feature that prevents you from connecting to ${m.help('#unprotected')} WebSockets.`,
    '',
  ]).concat(disclaimer).concat([
    '',
    m.h2('Instructions'),
    '',
    '1. Go to about:config',
    '2. Search for WebSocket',
    '3. Set allowInsecureFromHTTPS to true',
    '',
  ]);
}
