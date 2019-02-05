
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import Binary from '../plugins/binary.js';
import Clear from '../plugins/clear.js';
import Connect from '../plugins/connect.js';
import Disconnect from '../plugins/disconnect.js';
import Forget from '../plugins/forget.js';
import Help from '../plugins/help.js';
import Interval from '../plugins/interval.js';
import Pwa from '../plugins/pwa.js';
import Reset from '../plugins/reset.js';
import Send from '../plugins/send.js';
import Set from '../plugins/set.js';
import Spam from '../plugins/spam.js';
import Splash from '../plugins/splash.js';
import Unset from '../plugins/unset.js';
import Vars from '../plugins/vars.js';

export default class PluginsHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  load() {
    this._dwst.model.plugins.setPlugins([
      Binary,
      Clear,
      Connect,
      Disconnect,
      Forget,
      Help,
      Interval,
      Pwa,
      Reset,
      Send,
      Set,
      Spam,
      Splash,
      Unset,
      Vars,
    ]);
  }
}
