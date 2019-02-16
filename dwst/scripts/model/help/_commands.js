
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function commandsPage(commands) {

  const longNames = commands.filter(name => name.length > 1);

  return ([
    m.h1('Alphabetical List of Commands'),
    '',
    m.sectionList(longNames),
    m.line`Type ${m.syntax('/help <command>')} for usage`,
    '',
  ]);
}
