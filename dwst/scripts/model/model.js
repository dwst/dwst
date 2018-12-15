
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import ByteRange from '../functions/byte_range.js';
import CharRange from '../functions/char_range.js';
import RandomBytes from '../functions/random_bytes.js';
import RandomChars from '../functions/random_chars.js';
import Time from '../functions/time.js';
import Var from '../functions/var.js';

import config from './config.js';
import History from './history.js';
import Variables from './variables.js';
import Dwstgg from './dwstgg/dwstgg.js';

export default class Model {

  constructor(dwst, history, save) {
    this.config = config;
    this.history = new History(history, {save});
    this.dwstgg = new Dwstgg(dwst);
    this.connection = null;
    this.intervalId = null;
    this.variables = new Variables(dwst, [
      ByteRange,
      CharRange,
      RandomBytes,
      RandomChars,
      Time,
      Var,
    ]);
  }

}
