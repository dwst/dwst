
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function mainPage() {

  return [
    {
      type: 'h1',
      text: 'Help Pages',
    },
    '',
    [
      '- ',
      {
        type: 'help',
        text: '#introduction',
        section: '#introduction',
      },
      ' for beginners',
    ],
    [
      '- Working with ',
      {
        type: 'help',
        text: '#unprotected',
        section: '#unprotected',
      },
      ' sockets',
    ],
    [
      '- ',
      {
        type: 'help',
        text: '#privacy',
        section: '#privacy',
      },
      ' and tracking information',
    ],
    [
      '- Alphabetical list of ',
      {
        type: 'help',
        text: '#commands',
        section: '#commands',
      },
    ],
    [
      '- Alphabetical list of ',
      {
        type: 'help',
        text: '#functions',
        section: '#functions',
      },
    ],
    [
      '- DWST ',
      {
        type: 'help',
        text: '#development',
        section: '#development',
      },
    ],
    '',
    [
      'Open with ',
      {
        type: 'syntax',
        text: '/help #<keyword>',
      },
    ],
    '',
  ];
}

