
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {errorHandler, DwstError, NoConnection, AlreadyConnected, SocketError, InvalidParticles, InvalidArgument, InvalidCombination, UnknownCommand, UnknownInstruction, UnknownHelpPage, UnknownText, UnknownBinary} from '../errors.js';

import {expect} from 'chai';

describe('errors module', () => {
  describe('DwstError super class', () => {
    it('should be abstract', () => {
      expect(() => {
        new DwstError();
      }).to.throw();
    });
    it('should extend Error', () => {
      class DerivedError extends DwstError {}
      const error = new DerivedError();
      expect(error).to.be.an.instanceof(Error);
    });
  });
  describe('NoConnection error', () => {
    const error = new NoConnection('hello world');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the message that we were unable to deliver', () => {
      expect(error).to.include({
        msg: 'hello world',
      });
    });
  });
  describe('AlreadyConnected error', () => {
    const error = new AlreadyConnected();
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
  });
  describe('SocketError error', () => {
    const error = new SocketError();
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
  });
  describe('InvalidParticles error', () => {
    const error = new InvalidParticles();
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
  });
  describe('InvalidArgument error', () => {
    const error = new InvalidArgument('forget', ['you still have stuff in your history']);
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
  describe('InvalidCombination error', () => {
    const error = new InvalidCombination('spam', ['send', 'binary']);
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
  describe('UnkownCommand error', () => {
    const error = new UnknownCommand('foo');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the unknown command', () => {
      expect(error).to.include({
        command: 'foo',
      });
    });
  });
  describe('UnknownInstruction error', () => {
    const error = new UnknownInstruction('foo', 'send');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the unknown instruction and the commmand used', () => {
      expect(error).to.include({
        instruction: 'foo',
        command: 'send',
      });
    });
  });
  describe('UnknownHelpPage error', () => {
    const error = new UnknownHelpPage('foo');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the name of the requested page', () => {
      expect(error).to.include({
        page: 'foo',
      });
    });
  });
  describe(' UnkownText error', () => {
    const error = new UnknownText('foo');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the requested text variable name', () => {
      expect(error).to.include({
        variable: 'foo',
      });
    });
  });
  describe(' UnkownBinary error', () => {
    const error = new UnknownBinary('foo');
    it('should extend DwstError', () => {
      expect(error).to.be.an.instanceof(DwstError);
    });
    it('should store the requested binary variable name', () => {
      expect(error).to.include({
        variable: 'foo',
      });
    });
  });
  describe('errorHandler function', () => {

    class TerminalSimulator {

      constructor() {
        this.mlogCalled = false;
        this.mlogs = [];
        this.mlogTypes = [];
      }

      mlog(input, type) {
        this.mlogCalled = true;
        this.mlogs.push(input);
        this.mlogTypes.push(type);
      }
    }

    let fakedwst;

    beforeEach(() => {
      fakedwst = {
        ui: {
          terminal: new TerminalSimulator(),
        },
      };
    });

    it('should throw an error for unrecognized errors', () => {
      class UnexpectedDwstError extends DwstError {}
      expect(() => {
        errorHandler(fakedwst, new UnexpectedDwstError());
      }).to.throw(Error).that.does.include({
        message: 'missing error handler for UnexpectedDwstError',
      });
      expect(fakedwst.ui.terminal.mlogCalled).to.be.false;
      expect(fakedwst.ui.terminal.mlogs).to.deep.equal([]);
      expect(fakedwst.ui.terminal.mlogTypes).to.deep.equal([]);
    });
    it('should mlog InvalidParticles error', () => {
      errorHandler(fakedwst, new InvalidParticles());
      expect(fakedwst.ui.terminal.mlogCalled).to.be.true;
      expect(fakedwst.ui.terminal.mlogs).to.deep.equal([
        [
          'Syntax error.',
        ],
      ]);
      expect(fakedwst.ui.terminal.mlogTypes).to.deep.equal(['error']);
    });
  });
});
