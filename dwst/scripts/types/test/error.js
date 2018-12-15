
/**

  Authors: Toni Ruottu, Finland 2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import {expect} from 'chai';

import DwstError from '../error.js';

describe('DwstError data type', () => {
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
