
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
      text: 'DWST Guide to Galaxy',
    },
    '',
    'DWSTGG is here to help you get the most out of Dark WebSocket Terminal',
    '',
    {
      type: 'h2',
      text: 'Topics',
    },
    '',
    [
      '- ',
      {
        type: 'dwstgg',
        text: '#introduction',
        section: '#introduction',
      },
      ' for beginners',
    ],
    [
      '- Working with ',
      {
        type: 'dwstgg',
        text: '#unprotected',
        section: '#unprotected',
      },
      ' sockets',
    ],
    [
      '- ',
      {
        type: 'dwstgg',
        text: '#privacy',
        section: '#privacy',
      },
      ' and tracking information',
    ],
    [
      '- Alphabetical list of ',
      {
        type: 'dwstgg',
        text: '#commands',
        section: '#commands',
      },
    ],
    [
      '- Alphabetical list of ',
      {
        type: 'dwstgg',
        text: '#functions',
        section: '#functions',
      },
    ],
    [
      '- ',
      {
        type: 'dwstgg',
        text: '#developing',
        section: '#developing',
      },
      ' DWST itself',
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

