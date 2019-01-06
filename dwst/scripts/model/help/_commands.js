
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import sectionList from './_section_list.js';

export default function commandsPage(commands) {

  const listing = sectionList(commands);

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
