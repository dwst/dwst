
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function styleguidePage() {
  return [
    {
      type: 'h1',
      text: 'Living Styleguide',
    },
    '',
    [
      'DWST is built out of custom built user interface elements which are documented in the ',
      {
        type: 'link',
        text: 'living styleguide',
        url: '/styleguide',
      },
      '. The styleguide is generated automatically from KSS metadata which is included in related CSS files.',
    ],
  ];
}
