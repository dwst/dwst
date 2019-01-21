
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function introductionPage() {

  return [
    m.h1('Introduction for Beginners'),
    '',
    'DWST is used to manually interact with a WebSocket server.',
    '',
    m.h2('The Very Basics'),
    '',
    m.paragraph(
      m.line`Use the ${m.help('connect')} command to establish a connection.`,
      'Type in text to send messages.',
      m.line`End the connection with the ${m.help('disconnect')} command when you are done.`,
    ),
    '',
    m.h2('Convenience Tools'),
    '',
    m.paragraph(
      m.line`Use the ${m.help('send')} and ${m.help('binary')} commands to construct more complex messages.`,
      m.line`Setup a periodic send with the ${m.help('interval')} command or send a burst of messages with the ${m.help('spam')} command.`,
    ),
    '',
    m.h2('In Case of Emergency'),
    '',
    m.paragraph(
      m.line`Use the ${m.strong('escape key')} for an emergency shutdown if you feel that things are spinning out of control.`,
      m.line`Click on the DWST logo or use the ${m.help('splash')} command if you get lost.`,
    ),
    '',
  ];
}
