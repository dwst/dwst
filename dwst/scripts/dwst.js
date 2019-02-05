
/**

  Authors: Toni Ruottu, Finland 2010-2018
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import Model from './model/model.js';
import Ui from './ui/ui.js';
import Controller from './controller/controller.js';
import types from './types/types.js';
import lib from './lib/lib.js';

import DwstError from './types/abstract/error.js';

const dwst = Object.seal({
  model: null,
  ui: null,
  controller: null,
  types,
  lib,
});

dwst.model = new Model(dwst);
dwst.ui = new Ui(dwst);
dwst.controller = new Controller(dwst);

dwst.controller.plugins.load();
dwst.controller.functions.load();
dwst.controller.history.load();

document.addEventListener('DOMContentLoaded', () => {
  dwst.ui.init(document);
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
