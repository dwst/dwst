
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {expect} from 'chai';

import m from '../m.js';

describe('markdown module', () => {

  describe('sectionList function', () => {
    it('should work', () => {
      expect(m.sectionList(['foo', 'bar'])).to.deep.equal(m.paragraph(
        m.help('bar', 'bar', {spacing: true, wrap: false, afterText: ','}),
        m.help('foo', 'foo', {spacing: true, wrap: false}),
      ));
    });
  });
});
