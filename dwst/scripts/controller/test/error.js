
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {expect} from 'chai';

import errors from '../../lib/errors.js';
const {InvalidTemplateExpression} = errors;
import DwstError from '../../types/error.js';

import ErrorHandler from '../error.js';

describe('ErrorHandler class', () => {

  describe('onDwstError function', () => {

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
    let errorHandler;

    beforeEach(() => {
      fakedwst = {
        ui: {
          terminal: new TerminalSimulator(),
        },
      };
      errorHandler = new ErrorHandler(fakedwst);
    });

    it('should throw an error for unrecognized errors', () => {
      class UnexpectedDwstError extends DwstError {}
      expect(() => {
        errorHandler.onDwstError(new UnexpectedDwstError());
      }).to.throw(Error).that.does.include({
        message: 'missing error handler for UnexpectedDwstError',
      });
      expect(fakedwst.ui.terminal.mlogCalled).to.be.false;
      expect(fakedwst.ui.terminal.mlogs).to.deep.equal([]);
      expect(fakedwst.ui.terminal.mlogTypes).to.deep.equal([]);
    });
    it('should mlog InvalidTemplateExpression error', () => {
      errorHandler.onDwstError(new InvalidTemplateExpression(...[
        ['")"'],
        '}quux',
        'foo${bar(123, 456}quux',
      ]));
      expect(fakedwst.ui.terminal.mlogCalled).to.be.true;
      expect(fakedwst.ui.terminal.mlogs).to.deep.equal([
        [
          'Invalid template.',
          'foo${bar(123, 456}quux',
          '                 ^',
          'Expected ")", but got "}" instead.',
        ],
      ]);
      expect(fakedwst.ui.terminal.mlogTypes).to.deep.equal(['error']);
    });
  });
});
