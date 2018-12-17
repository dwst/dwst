
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import rewire from 'rewire';
import {expect} from 'chai';

const socketRewire = rewire('../socket.js');
const createLines = socketRewire.__get__('createLines');

describe('SocketHandler module', () => {

  describe('createLines function', () => {
    it('should mlog InvalidTemplateExpression error', () => {

      expect(createLines(['foo'])).to.deep.equal([
        ['foo'],
      ]);

      expect(createLines(['foo', {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}],
        ['bar'],
      ]);

      expect(createLines(['foo', {text: '\\n'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}],
        [{text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}, {text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\n'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}, {text: '\\r'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}],
        [{text: '\\r'}],
        ['bar'],
      ]);

      expect(createLines(['foo', {text: '\\n'}, {text: '\\n'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}],
        [{text: '\\n'}],
        [{text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\n'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}, {text: '\\n'}],
        [{text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\n'}, {text: '\\r'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}, {text: '\\r'}],
        [{text: '\\n'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\r'}, {text: '\\n'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}],
        [{text: '\\r'}, {text: '\\n'}],
        ['bar'],
      ]);

      expect(createLines(['foo', {text: '\\n'}, {text: '\\n'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}],
        [{text: '\\n'}, {text: '\\r'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\n'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}, {text: '\\n'}],
        [{text: '\\r'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\n'}, {text: '\\r'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\n'}, {text: '\\r'}],
        [{text: '\\r'}],
        ['bar'],
      ]);
      expect(createLines(['foo', {text: '\\r'}, {text: '\\r'}, {text: '\\r'}, 'bar'])).to.deep.equal([
        ['foo', {text: '\\r'}],
        [{text: '\\r'}],
        [{text: '\\r'}],
        ['bar'],
      ]);

    });
  });
});
