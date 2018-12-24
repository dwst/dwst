
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

const commands = [
  'git clone https://github.com/dwst/dwst.git',
  'cd dwst',
  'npm install -g yarn',
  'yarn',
  'gulp dev',
];

const commandSegments = commands.map(c => {
  return {
    type: 'code',
    text: c,
  };
});

export default function developmentPage() {
  return ([
    {
      type: 'h1',
      text: 'DWST Development Server',
    },
    '',
    'You can run DWST development server by executing the following commands in the shell near you.',
    '',
  ]).concat(commandSegments).concat([
    '',
    [
      'This is useful if you wish to customise DWST on source code level but can also be used to access ',
      {
        type: 'dwstgg',
        text: '#unprotected',
        section: '#unprotected',
      },
      ' WebSockets.',
    ],
    '',
  ]);
}
