/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import errors from '../lib/errors.js';
const {NoConnection, AlreadyConnected, SocketError, InvalidTemplateExpression, InvalidArgument, InvalidCombination, InvalidUtf8, InvalidDataType, UnknownCommand, UnknownInstruction, UnknownHelpPage, UnknownVariable} = errors;

function commaCommaOr(stringList) {
  if (stringList.length === 0) {
    throw new Error('list has to have at least one item');
  }
  if (stringList.length === 1) {
    return stringList[0];
  }
  const last = stringList[stringList.length - 1];
  const listExcludingLast = stringList.slice(0, stringList.length - 1);
  const upToSecondLastJoined = listExcludingLast.join(', ');
  return `${upToSecondLastJoined} or ${last}`;
}

export default class ErrorHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  _errorToMLog(error) {
    if (error instanceof NoConnection) {
      const connectTip = [
        'Use ',
        {
          type: 'dwstgg',
          text: 'connect',
          section: 'connect',
        },
        ' to form a connection and try again.',
      ];
      return ['No connection.', `Cannot send: ${error.msg}`, connectTip];
    }
    if (error instanceof AlreadyConnected) {
      return [
        'Already connected to a server',
        [
          'Type ',
          {
            type: 'command',
            text: '/disconnect',
          },
          ' to end the connection',
        ],
      ];
    }
    if (error instanceof SocketError) {
      return ['WebSocket error.'];
    }
    if (error instanceof InvalidTemplateExpression) {
      const padding = ' '.repeat(error.errorPosition);
      const expected = commaCommaOr(error.expected);
      const got = error.remainder.charAt(0);
      return [
        'Invalid template.',
        error.expression,
        `${padding}^`,
        `Expected ${expected}, but got "${got}" instead.`,
      ];
    }
    if (error instanceof InvalidArgument) {
      return [`Invalid argument: ${error.argument}`, error.extraInfo];
    }
    if (error instanceof InvalidCombination) {
      return [
        [
          'Invalid ',
          {
            type: 'dwstgg',
            text: error.command,
            section: error.command,
          },
          ' command combination.',
        ],
        [
          'Compatible commands: ',
          error.commands.join(', '),
        ],
      ];
    }
    if (error instanceof InvalidUtf8) {
      return [
        [
          `Utf-8 decoder failed to process ${error.buffer.byteLength}B buffer`,
        ],
        error.buffer,
      ];
    }
    if (error instanceof InvalidDataType) {
      return [
        [
          `Variable ${error.variable} is not a ${commaCommaOr(error.expected)}`,
        ],
      ];
    }
    if (error instanceof UnknownCommand) {
      return [
        [
          'Unknown command ',
          {
            type: 'strong',
            text: error.command,
          },
        ],
        [
          'Type ',
          {
            type: 'command',
            text: '/help #commands',
          },
          ' to list available commands',
        ],
      ];
    }
    if (error instanceof UnknownInstruction) {
      return [
        [
          'Unknown function ',
          {
            type: 'strong',
            text: error.instruction,
          },
        ],
        [
          'Type ',
          {
            type: 'command',
            text: '/help #functions',
          },
          ' to list available functions',
        ],
      ];
    }
    if (error instanceof UnknownHelpPage) {
      const listTip = [
        'Display help index by typing ',
        {
          type: 'command',
          text: '/help',
        },
      ];
      return [`Unkown help page: ${error.page}`, listTip];
    }
    if (error instanceof UnknownVariable) {
      const listTip = [
        'List available variables by typing ',
        {
          type: 'command',
          text: '/vars',
        },
      ];
      return [`Variable "${error.variable}" does not exist.`, listTip];
    }

    throw new Error(`missing error handler for ${error.constructor.name}`);
  }

  onDwstError(error) {
    this._dwst.ui.terminal.mlog(this._errorToMLog(error), 'error');
  }
}
