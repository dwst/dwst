/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstError from '../types/error.js';

class NoConnection extends DwstError {
  constructor(msg) {
    super();
    this.msg = msg;
  }
}

class AlreadyConnected extends DwstError {}

class SocketError extends DwstError {}

class InvalidTemplateExpression extends DwstError {
  constructor(expected, remainder, expression = null) {
    super();
    this.expected = expected;
    this.remainder = remainder;
    this.expression = expression;
  }
  get errorPosition() {
    return this.expression.length - this.remainder.length;
  }
}

class InvalidArgument extends DwstError {
  constructor(argument, extraInfo) {
    super();
    this.argument = argument;
    this.extraInfo = extraInfo;
  }
}

class InvalidCombination extends DwstError {
  constructor(command, commands) {
    super();
    this.command = command;
    this.commands = commands;
  }
}

class InvalidUtf8 extends DwstError {
  constructor(buffer) {
    super();
    this.buffer = buffer;
  }
}

class InvalidDataType extends DwstError {
  constructor(variable, expected) {
    super();
    this.variable = variable;
    this.expected = expected;
  }
}

class UnknownCommand extends DwstError {
  constructor(command) {
    super();
    this.command = command;
  }
}

class UnknownInstruction extends DwstError {
  constructor(instruction) {
    super();
    this.instruction = instruction;
  }
}

class UnknownHelpPage extends DwstError {
  constructor(page) {
    super();
    this.page = page;
  }
}

class UnknownVariable extends DwstError {
  constructor(variable) {
    super();
    this.variable = variable;
  }
}

export default {
  NoConnection,
  AlreadyConnected,
  SocketError,
  InvalidTemplateExpression,
  InvalidArgument,
  InvalidCombination,
  InvalidUtf8,
  InvalidDataType,
  UnknownCommand,
  UnknownInstruction,
  UnknownHelpPage,
  UnknownVariable,
};
