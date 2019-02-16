
/**

  Authors: Toni Ruottu, Finland 2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function simulatorPage() {
  return [
    m.h1('Server Simulator'),
    '',
    m.paragraph(
      'The built-in server simulator can be used for manual testing of dwst itself.',
      'It exists so dwst developers do not have to setup or burden test servers.',
      'It can be used for offline testing since it does not use the network.',
    ),
    '',
    m.h2('Modes'),
    '',
    m.command('/connect dwst://echo'),
    'returns sent messages back to you',
    '',
    m.command('/connect dwst://flood'),
    'creates a flood of incoming messages',
  ];
}
