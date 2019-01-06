
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function developmentPage() {
  return [
    {
      type: 'h1',
      text: 'DWST Development',
    },
    '',
    [
      '- Run the ',
      {
        type: 'help',
        text: '#local',
        section: '#local',
      },
      ' development server',
    ],
    [
      '- User interface ',
      {
        type: 'help',
        text: '#styleguide',
        section: '#styleguide',
      },
    ],
    [
      '- WebSocket server ',
      {
        type: 'help',
        text: '#simulator',
        section: '#simulator',
      },
    ],
  ];
}
