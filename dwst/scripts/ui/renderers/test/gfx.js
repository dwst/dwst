
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import rewire from 'rewire';
import {expect} from 'chai';

const gfxRewire = rewire('../gfx.js');
const colorMasks = gfxRewire.__get__('colorMasks');
const izip = gfxRewire.__get__('izip');

describe('gfx module', () => {

  describe('colorMasks function', () => {
    it('should split single pattern', () => {
      expect([...colorMasks('1')]).to.deep.equal(['1']);
    });
    it('should split several short patterns', () => {
      expect([...colorMasks('123')]).to.deep.equal(['1', '2', '3']);
    });
    it('should split several long patterns', () => {
      expect([...colorMasks('112233')]).to.deep.equal(['11', '22', '33']);
    });
    it('should support repeat with single pattern', () => {
      expect([...colorMasks('1 ')]).to.deep.equal(['11']);
    });
    it('should support repeat after short pattern', () => {
      expect([...colorMasks('1 2 3 ')]).to.deep.equal(['11', '22', '33']);
    });
    it('should support repeat after long pattern', () => {
      expect([...colorMasks('11 22 33 ')]).to.deep.equal(['111', '222', '333']);
    });
    it('should support repeat in the middle of long pattern', () => {
      expect([...colorMasks('1 12 23 3')]).to.deep.equal(['111', '222', '333']);
    });
    it('should complain when pattern starts with repeat character', () => {
      expect(() => {
        colorMasks(' ').next();
      }).to.throw('invalid color mask');
    });
  });

  describe('izip function', () => {
    it('should zip two arrays', () => {
      expect([...izip([1, 2, 3], [4, 5, 6])]).to.deep.equal([[1, 4], [2, 5], [3, 6]]);
    });
    it('should return iterator', () => {
      expect(izip([1], [4])[Symbol.iterator]).to.be.a('function');
    });
  });
});
