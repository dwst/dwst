
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function developmentPage() {
  return [
    m.h1('DWST Development'),
    '',
    m.line`- Run the ${m.help('#local')} development server`,
    m.line`- WebSocket server ${m.help('#simulator')}`,
  ];
}
