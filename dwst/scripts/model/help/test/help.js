
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import rewire from 'rewire';
import {expect} from 'chai';

const helpRewire = rewire('../help.js');
const crumbSections = helpRewire.__get__('crumbSections');

describe('help module', () => {

  describe('crumbSections function', () => {
    it('should support main page', () => {
      expect([...crumbSections('#help')]).to.deep.equal(['#help']);
    });
    it('should support subpage', () => {
      expect([...crumbSections('#privacy')]).to.deep.equal(['#help', '#privacy']);
    });
    it('should support subpage of a subpage', () => {
      expect([...crumbSections('#simulator')]).to.deep.equal(['#help', '#development', '#simulator']);
    });
    it('should support command page', () => {
      expect([...crumbSections('send')]).to.deep.equal(['#help', '#commands', 'send']);
    });
    it('should support function page', () => {
      expect([...crumbSections('randomBytes()')]).to.deep.equal(['#help', '#functions', 'randomBytes()']);
    });
  });
});
