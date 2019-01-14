
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m.js';

const gaSection = m.paragraph(
  m.line`We use ${m.link('https://www.google.com/analytics/', 'Google Analytics')} to collect information about DWST usage.`,
  'The main motivation is to collect statistical information to aid us develop and promote the software.',
);

const disableTracking = m.paragraph(
  'There are several ways to disable tracking.',
  m.line`You could use some browser extension that blocks Google Analytics or you could use the ${m.help('#local')} DWST server which should have Google Analytics disabled.`,
);

const storageSection = m.paragraph(
  'Google Analytics stores some information in cookies.',
  'DWST itself uses local storage for storing command history.',
  m.line`You may use the built-in ${m.help('forget')} command to quickly remove stored command history.`,
  'Consider using tools provided by your browser for more serious cleaning.',
);

const futureChanges = m.paragraph(
  'This describes how we do things today.',
  'Check this page again sometime for possible updates on privacy and tracking considerations.',
);

export default function privacyPage() {

  return [
    m.h1('Privacy and Tracking Information'),
    '',
    gaSection,
    '',
    disableTracking,
    '',
    storageSection,
    '',
    futureChanges,
    '',
  ];
}
