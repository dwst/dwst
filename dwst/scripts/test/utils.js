
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import utils from '../utils.js';
import {expect} from 'chai';

describe('utils', () => {
  describe('parseNum function', () => {
    it('should support decimal values', () => {
      const result = utils.parseNum('123');
      expect(result).to.equal(123);
    });

    it('should support hex values', () => {
      const result = utils.parseNum('0x10');
      expect(result).to.equal(0x10);
    });
  });
});
