
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function styleguidePage() {
  return [
    m.h1('Living Styleguide'),
    '',
    m.paragraph(
      m.line`DWST is built out of custom built user interface elements which are documented in the ${m.link('/styleguide', 'living styleguide')}.`,
      'The styleguide is generated automatically from KSS metadata which is included in related CSS files.',
    ),
  ];
}
