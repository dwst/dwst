
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import LinkHandler from './link.js';
import PromptHandler from './prompt.js';
import SocketHandler from './socket.js';
import ErrorHandler from './error.js';
import PwaHandler from './pwa.js';

export default class Controller {

  constructor(dwst) {
    this.link = new LinkHandler(dwst);
    this.prompt = new PromptHandler(dwst);
    this.socket = new SocketHandler(dwst);
    this.error = new ErrorHandler(dwst);
    this.pwa = new PwaHandler(dwst);
  }
}
