/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export class DwstError extends Error {
  constructor() {
    super();
    if (new.target === DwstError) {
      throw new Error('abstract');
    }
  }
}

class NoConnection extends DwstError {
  constructor(msg) {
    super();
    this.msg = msg;
  }
}

class AlreadyConnected extends DwstError {}

class SocketError extends DwstError {}

class InvalidParticles extends DwstError {
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

class UnknownText extends DwstError {
  constructor(variable) {
    super();
    this.variable = variable;
  }
}

class UnknownBinary extends DwstError {
  constructor(variable) {
    super();
    this.variable = variable;
  }
}

export default {
  NoConnection,
  AlreadyConnected,
  SocketError,
  InvalidParticles,
  InvalidArgument,
  InvalidCombination,
  UnknownCommand,
  UnknownInstruction,
  UnknownHelpPage,
  UnknownText,
  UnknownBinary,
};
