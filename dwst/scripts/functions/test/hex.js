
/**

  Authors: Toni Ruottu, Finland 2017-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import rewire from 'rewire';
import {expect} from 'chai';
const hex = rewire('../hex.js');

describe('hex function', () => {
  describe('hexpairtobyte helper function', () => {
    it('should convert hex pair to byte', () => {
      expect(hex.__get__('hexpairtobyte')(['0', '0'])).to.equal(0);
      expect(hex.__get__('hexpairtobyte')(['a', 'b'])).to.equal(171);
      expect(hex.__get__('hexpairtobyte')(['f', 'f'])).to.equal(255);
    });
  });
});
