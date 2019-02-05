
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import ByteRange from '../functions/byte_range.js';
import CharRange from '../functions/char_range.js';
import File from '../functions/file.js';
import RandomBytes from '../functions/random_bytes.js';
import RandomChars from '../functions/random_chars.js';
import Time from '../functions/time.js';

export default class FunctionsHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  load() {
    this._dwst.model.variables.setFunctions([
      ByteRange,
      CharRange,
      File,
      RandomBytes,
      RandomChars,
      Time,
    ]);
  }
}
