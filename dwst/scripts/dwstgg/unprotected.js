
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function unprotectedPage() {
  return [
    {
      type: 'h1',
      text: 'Working with Unprotected WebSockets',
    },
    '',
    [
      'Browsers tend to prevent unprotected WebSockets connections from secure origins. ',
      'You may encounter this problem if your target WebSocket address starts with',
      {
        type: 'strong',
        text: ' ws://',
      },
    ],
    '',
    {
      type: 'h2',
      text: 'Use wss INSTEAD',
    },
    '',
    [
      'The most straight forward fix is to use the secure address instead. ',
      'However, the server needs to accept secure connections for this to work.',
    ],
    '',
    {
      type: 'h2',
      text: 'Use Dev Server',
    },
    '',
    [
      'The connection restrictions apply to DWST since it is served over https. ',
      'You can work around the problem by setting up the DWST ',
      {
        type: 'dwstgg',
        text: '#development',
        section: '#development',
      },
      ' server on your local work station.',
    ],
    '',
    {
      type: 'h2',
      text: 'Disable Security',
    },
    '',
    [
      'Finally, you have the option of disabling related browser security features. ',
      'However, doing this will screw up your security and release testing. ',
      'Nevertheless we have instructions for ',
      {
        type: 'dwstgg',
        text: '#Chrome',
        section: '#chrome',
      },
      ' and ',
      {
        type: 'dwstgg',
        text: '#Firefox',
        section: '#firefox',
      },
      '.',
    ],
    '',
  ];
}
