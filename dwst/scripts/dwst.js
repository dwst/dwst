
/**

  Authors: Toni Ruottu, Finland 2010-2018
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import lib from './lib/lib.js';
import Model from './model/model.js';
import Ui from './ui/ui.js';
import Controller from './controller/controller.js';
import Plugins from './model/plugins.js';

import DwstError from './types/error.js';

import Binary from './plugins/binary.js';
import Clear from './plugins/clear.js';
import Connect from './plugins/connect.js';
import Disconnect from './plugins/disconnect.js';
import Forget from './plugins/forget.js';
import Help from './plugins/help.js';
import Interval from './plugins/interval.js';
import Loadbin from './plugins/loadbin.js';
import Loadtext from './plugins/loadtext.js';
import Pwa from './plugins/pwa.js';
import Reset from './plugins/reset.js';
import Send from './plugins/send.js';
import Spam from './plugins/spam.js';
import Splash from './plugins/splash.js';
import Vars from './plugins/vars.js';

function loadModel(dwst) {
  const HISTORY_KEY = 'history';
  const response = localStorage.getItem(HISTORY_KEY);
  const save = function (history) {
    const saveState = JSON.stringify(history);
    localStorage.setItem(HISTORY_KEY, saveState);
  };
  let history = [];
  if (response !== null) {
    history = JSON.parse(response);
  }
  return new Model(dwst, history, save);
}

const dwst = Object.seal({
  lib,
  model: null,
  ui: null,
  controller: null,
  plugins: null,
  functions: null,
});

dwst.model = loadModel(dwst);

dwst.controller = new Controller(dwst);

dwst.plugins = new Plugins(dwst, [
  Binary,
  Clear,
  Connect,
  Disconnect,
  Forget,
  Help,
  Interval,
  Loadbin,
  Loadtext,
  Pwa,
  Reset,
  Send,
  Spam,
  Splash,
  Vars,
]);

document.addEventListener('DOMContentLoaded', () => {
  dwst.ui = new Ui(document, dwst);
  dwst.ui.init();
});

window.addEventListener('load', () => {
  dwst.ui.onLoad();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service_worker.js');
  }
});

window.addEventListener('error', evt => {
  if (evt.error instanceof DwstError) {
    evt.preventDefault();
    dwst.controller.error.onDwstError(evt.error);
  }
});

window.addEventListener('beforeinstallprompt', evt => {
  dwst.controller.pwa.beforeInstallPrompt(evt);
});


// for live debugging
window._dwst = dwst;
