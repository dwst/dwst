
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function unprotectedPage() {
  return [
    m.h1('Working with Unprotected WebSockets'),
    '',
    m.paragraph(
      'Browsers tend to prevent unprotected WebSockets connections from secure origins.',
      m.line`You may encounter this problem if your target WebSocket address starts with ${m.strong('ws://')}`,
    ),
    '',
    m.h2('Use wss INSTEAD'),
    '',
    m.paragraph(
      'The most straight forward fix is to use the secure address instead.',
      'However, the server needs to accept secure connections for this to work.',
    ),
    '',
    m.h2('Use Dev Server'),
    '',
    m.paragraph(
      'The connection restrictions apply to DWST since it is served over https.',
      m.line`You can work around the problem by setting up ${m.help('#local')} DWST server on your workstation.`,
    ),
    '',
    m.h2('Disable Security'),
    '',
    m.paragraph(
      'Finally, you have the option of disabling related browser security features.',
      'However, doing this will screw up your security and release testing.',
      m.line`Nevertheless we have instructions for ${m.help('#chrome')} and ${m.help('#firefox')}.`,
    ),
    '',
  ];
}
