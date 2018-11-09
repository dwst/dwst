
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function developingPage() {
  return [
    {
      type: 'h1',
      text: 'DWST Development',
    },
    '',
    [
      '- Run the ',
      {
        type: 'dwstgg',
        text: '#development',
        section: '#development',
      },
      ' server',
    ],
    [
      '- User interface ',
      {
        type: 'dwstgg',
        text: '#styleguide',
        section: '#styleguide',
      },
    ],
    [
      '- WebSocket server ',
      {
        type: 'dwstgg',
        text: '#simulator',
        section: '#simulator',
      },
    ],
  ];
}
