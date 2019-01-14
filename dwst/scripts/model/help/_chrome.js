
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m.js';

const disclaimer = [
  m.h2('!!! Follow at your own risk !!!'),
  '',
  'Disabling security is generally a bad idea and you should only do it if you understand the implications.',
];

export default function chromePage() {
  return ([
    m.h1('Insecure WebSocket Access in Chrome'),
    '',
    m.line`Chrome lets you temporarily bypass the security feature that prevents you from connecting to ${m.help('#unprotected')} WebSockets.`,
    '',
  ]).concat(disclaimer).concat([
    '',
    m.h2('Instructions'),
    '',
    m.line`1. Use ${m.help('connect')} on a ws:// address`,
    '2. Look for a shield icon',
    '3. Click on the shield icon',
    '4. Click "Load unsafe scripts"',
    '5. Use connect again',
    '',
  ]);
}
