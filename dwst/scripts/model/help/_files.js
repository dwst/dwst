
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import m from '../../types/m/m.js';

export default function filesPage() {

  return [
    m.h1('Working with Files and Variables'),
    '',
    m.paragraph(
      m.line`You may embed files in your messages.`,
      m.line`Simply use ${m.help('file()')} function in your message and DWST will provide you with a file selector.`,
      m.line`The ${m.help('send')} command expects ${m.strong('utf-8')} encoded text, while the ${m.help('binary')} command is agnostic and accepts any data type.`,
    ),
    '',
    m.command('/s ${file()}'),
    m.command('/b ${file()}'),
    '',
    m.paragraph(
      m.line`You may store files into variables with the ${m.help('set')} command.`,
      m.line`This lets you use the same data in multiple messages.`,
      m.line`You can list your variables and their contents with the ${m.help('vars')} command and remove obsolete variables with the ${m.help('unset')} command.`,
    ),
    '',
    m.command('/set foo ${file()}'),
    m.command('/vars'),
    m.command('/vars foo'),
    m.command('/s ${foo}'),
    m.command('/b ${foo}'),
    m.command('/unset foo'),
  ];
}
