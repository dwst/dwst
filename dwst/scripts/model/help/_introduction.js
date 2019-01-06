
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default function introductionPag() {

  return [
    {
      type: 'h1',
      text: 'Introduction for Beginners',
    },
    '',
    'DWST is used to manually interact with a WebSocket server.',
    '',
    {
      type: 'h2',
      text: 'The Very Basics',
    },
    '',
    [
      'Use the ',
      {
        type: 'help',
        text: 'connect',
        section: 'connect',
      },
      ' command to establish a connection. ',
      'Type in text to send messages. ',
      'End the connection with the ',
      {
        type: 'help',
        text: 'disconnect',
        section: 'disconnect',
      },
      ' command when you are done.',
    ],
    '',
    {
      type: 'h2',
      text: 'Convenience Tools',
    },
    '',
    [
      'Use the ',
      {
        type: 'help',
        text: 'send',
        section: 'send',
      },
      ' and ',
      {
        type: 'help',
        text: 'binary',
        section: 'binary',
      },
      ' commands to construct more complex messages. ',
      'Setup a periodic send with the ',
      {
        type: 'help',
        text: 'interval',
        section: 'interval',
      },
      ' command or send a burst of messages with the ',
      {
        type: 'help',
        text: 'spam',
        section: 'spam',
      },
      ' command.',
    ],
    '',
    {
      type: 'h2',
      text: 'In Case of Emergency',
    },
    '',
    [
      'Use the ',
      {
        type: 'strong',
        text: 'escape key',
      },
      ' for an emergency shutdown if you feel that things are spinning out of control. ',
      '',
      'Click on the DWST logo or use the ',
      {
        type: 'help',
        text: 'splash',
        section: 'splash',
      },
      ' command if you get lost.',
    ],
    '',
  ];
}
