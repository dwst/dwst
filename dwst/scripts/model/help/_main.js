
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function mainPage() {

  return [
    m.h1('Help Pages'),
    '',
    m.line`- ${m.help('#introduction')} for beginners`,
    m.line`- Working with ${m.help('#unprotected')} sockets`,
    m.line`- Working with ${m.help('#files')} and variables`,
    m.line`- ${m.help('#privacy')} and tracking information`,
    m.line`- Alphabetical list of ${m.help('#commands')}`,
    m.line`- Alphabetical list of ${m.help('#functions')}`,
    m.line`- DWST ${m.help('#development')}`,
    '',
    m.line`Open with ${m.syntax('/help #<keyword>')}`,
    '',
  ];
}

