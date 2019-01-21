
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {expect} from 'chai';

import errors from '../errors.js';
import DwstError from '../../abstract/error.js';

describe('NoConnection', () => {
  const error = new errors.NoConnection('hello world');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the message that we were unable to deliver', () => {
    expect(error).to.include({
      msg: 'hello world',
    });
  });
});
describe('AlreadyConnected', () => {
  const error = new errors.AlreadyConnected();
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
});
describe('SocketError', () => {
  const error = new errors.SocketError();
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
});
describe('InvalidTemplateExpression', () => {
  const stringOrArray = Symbol();
  const error = new errors.InvalidTemplateExpression(stringOrArray, ',456)}');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should construct succesfully without expression argument', () => {
    expect(error).to.deep.include({
      expected: stringOrArray,
      remainder: ',456)}',
      expression: null,
    });
  });
  it('should allow setting expression after creation', () => {
    error.expression = '${foo(,456)}';
    expect(error).to.deep.include({
      expected: stringOrArray,
      remainder: ',456)}',
      expression: '${foo(,456)}',
    });
  });
  it('should provide correct error position', () => {
    error.expression = '${foo(,456)}';
    expect(error.errorPosition).to.equal('${foo(,456)}'.indexOf(','));
  });
});
describe('InvalidArgument', () => {
  const error = new errors.InvalidArgument('forget', ['you still have stuff in your history']);
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the invalid argument and extra info', () => {
    expect(error).to.deep.include({
      argument: 'forget',
      extraInfo: ['you still have stuff in your history'],
    });
  });
});
describe('InvalidCombination', () => {
  const error = new errors.InvalidCombination('spam', ['send', 'binary']);
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store main command and compatible commands', () => {
    expect(error).to.deep.include({
      command: 'spam',
      commands: ['send', 'binary'],
    });
  });
});
describe('InvalidUtf8', () => {
  const invalid = new Uint8Array([0xa0]);
  const error = new errors.InvalidUtf8(invalid.buffer);
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store buffer', () => {
    expect(error).to.deep.include({
      buffer: invalid.buffer,
    });
  });
});
describe('InvalidDataType', () => {
  const error = new errors.InvalidDataType('randomBytes', ['FUNCTION']);
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store variable name', () => {
    expect(error).to.deep.include({
      variable: 'randomBytes',
    });
  });
  it('should store expected type', () => {
    expect(error).to.deep.include({
      expected: ['FUNCTION'],
    });
  });
});
describe('InvalidVariableNamee', () => {
  const error = new errors.InvalidVariableName('?');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store variable name', () => {
    expect(error).to.deep.include({
      variable: '?',
    });
  });
});
describe('UnkownCommand', () => {
  const error = new errors.UnknownCommand('foo');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the unknown command', () => {
    expect(error).to.include({
      command: 'foo',
    });
  });
});
describe('UnknownInstruction', () => {
  const error = new errors.UnknownInstruction('foo');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the unknown instruction', () => {
    expect(error).to.include({
      instruction: 'foo',
    });
  });
});
describe('UnknownHelpPage', () => {
  const error = new errors.UnknownHelpPage('foo');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the name of the requested page', () => {
    expect(error).to.include({
      page: 'foo',
    });
  });
});
describe(' UnkownVariable', () => {
  const error = new errors.UnknownVariable('foo');
  it('should extend DwstError', () => {
    expect(error).to.be.an.instanceof(DwstError);
  });
  it('should store the requested text variable name', () => {
    expect(error).to.include({
      variable: 'foo',
    });
  });
});
