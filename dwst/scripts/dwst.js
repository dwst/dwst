
/**

  Authors: Toni Ruottu, Finland 2010-2018
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import config from './config.js';

import {escapeForParticles} from './particles.js';
import currenttime from './currenttime.js';
import HistoryManager from './history_manager.js';

import Terminal from './terminal.js';

import Binary from './plugins/binary.js';
import Bins from './plugins/bins.js';
import Clear from './plugins/clear.js';
import Connect from './plugins/connect.js';
import Disconnect from './plugins/disconnect.js';
import Forget from './plugins/forget.js';
import Help from './plugins/help.js';
import Interval from './plugins/interval.js';
import Loadbin from './plugins/loadbin.js';
import Loadtext from './plugins/loadtext.js';
import Reset from './plugins/reset.js';
import Send from './plugins/send.js';
import Spam from './plugins/spam.js';
import Splash from './plugins/splash.js';
import Texts from './plugins/texts.js';


let resizePending = false;

const controller = {

  silent,
  run,

  onHelpLinkClick: command => {
    loud(command);
  },

  onCommandLinkClick: command => {
    pluginInterface.historyManager.select(command);
    loud(command);
  },

  onConnectionOpen: protocol => {
    const selected = (() => {
      if (protocol.length < 1) {
        return [];
      }
      return [`Selected protocol: ${protocol}`];
    })();
    terminal.mlog(['Connection established.'].concat(selected), 'system');
    [...document.getElementsByClassName('dwst-button--splash')].forEach(element => {
      element.classList.replace('dwst-button--splash', 'dwst-button--splash-connected');
    });
  },

  onConnectionClose: (e, sessionLength) => {
    const meanings = {
      1000: 'Normal Closure',
      1001: 'Going Away',
      1002: 'Protocol error',
      1003: 'Unsupported Data',
      1005: 'No Status Rcvd',
      1006: 'Abnormal Closure',
      1007: 'Invalid frame payload data',
      1008: 'Policy Violation',
      1009: 'Message Too Big',
      1010: 'Mandatory Ext.',
      1011: 'Internal Server Error',
      1015: 'TLS handshake',
    };
    const code = (() => {
      if (meanings.hasOwnProperty(e.code)) {
        return `${e.code} (${meanings[e.code]})`;
      }
      return `${e.code}`;
    })();
    const reason = (() => {
      if (e.reason.length < 1) {
        return [];
      }
      return [`Close reason: ${e.reason}`];
    })();
    const sessionLengthString = (() => {
      if (sessionLength === null) {
        return [];
      }
      return [`Session length: ${sessionLength}ms`];
    })();
    terminal.mlog(['Connection closed.', `Close status: ${code}`].concat(reason).concat(sessionLengthString), 'system');
    pluginInterface.connection = null;
    [...document.getElementsByClassName('dwst-button--splash-connected')].forEach(element => {
      element.classList.replace('dwst-button--splash-connected', 'dwst-button--splash');
    });
  },

  onMessage: msg => {
    if (typeof msg === 'string') {
      terminal.log(msg, 'received');
    } else {
      const fr = new FileReader();
      fr.onload = function (e) {
        const buffer = e.target.result;
        terminal.blog(buffer, 'received');
      };
      fr.readAsArrayBuffer(msg);
    }
  },

  onError: () => {
    terminal.log('WebSocket error.', 'error');
  },

  onSendWhileConnecting: verb => {
    terminal.log(`Attempting to send data while ${verb}`, 'warning');
  },

};

const terminal = new Terminal('ter1', controller);

const pluginInterface = {

  VERSION: config.appVersion,
  ECHO_SERVER_URL: config.echoServer,

  terminal,
  controller,
  historyManager: null,
  connection: null,
  commands: null,
  bins: new Map(),
  texts: new Map(),
  intervalId: null,

};


const plugins = [
  Binary,
  Bins,
  Clear,
  Connect,
  Disconnect,
  Forget,
  Help,
  Interval,
  Loadbin,
  Loadtext,
  Reset,
  Send,
  Spam,
  Splash,
  Texts,
];
pluginInterface.commands = new Map();
for (const Constructor of plugins) {
  const plugin = new Constructor(pluginInterface);
  for (const command of plugin.commands()) {
    pluginInterface.commands.set(command, plugin);
  }
}

function run(command) {
  const [pluginName, ...params] = command.split(' ');
  const paramString = params.join(' ');

  const plugin = pluginInterface.commands.get(pluginName);
  if (typeof plugin === 'undefined') {
    const errorMessage = `invalid command: ${pluginName}`;
    const helpTip = [
      'type ',
      {
        type: 'command',
        text: '/help',
      },
      ' to list available commands',
    ];
    terminal.mlog([errorMessage, helpTip], 'error');
    return;
  }
  plugin.run(paramString);
}

function refreshclock() {
  const time = currenttime();
  document.getElementById('clock1').innerHTML = time;
}

function silent(line) {
  const noslash = line.substring(1);
  run(noslash);
}

function loud(line) {
  terminal.log(line, 'command');
  silent(line);
}

function enableDebugger() {
  document.documentElement.classList.add('dwst-debug--guides');
}

function showHelpTip() {
  const helpTip = [
    'type ',
    {
      type: 'command',
      text: '/help',
    },
    ' to list available commands',
  ];
  terminal.log(helpTip, 'system');
}

function send() {
  const raw = document.getElementById('msg1').value;
  document.getElementById('msg1').value = '';
  pluginInterface.historyManager.select(raw);
  if (raw === '/idkfa') {
    enableDebugger();
    return;
  }
  if (raw.length < 1) {
    showHelpTip();
    return;
  }
  if (raw[0] === '/') {
    loud(raw);
    return;
  }
  const text = escapeForParticles(raw);
  const command = `/send ${text}`;
  loud(command);
}

function globalKeyPress(event) {
  const msg1 = document.getElementById('msg1');
  if (event.key === 'Escape') {
    if (pluginInterface.connection !== null && (pluginInterface.connection.isOpen() || pluginInterface.connection.isConnecting())) {
      loud('/disconnect');
    } else if (msg1.value === '') {
      const connects = pluginInterface.historyManager.getConnectCommands(1);
      if (connects.length < 1) {
        msg1.value = `/connect ${pluginInterface.ECHO_SERVER_URL}`;
      } else {
        msg1.value = connects[0];
      }
    } else {
      pluginInterface.historyManager.select(msg1.value);
      msg1.value = '';
    }
  }
}

function msgKeyPress(event) {
  const msg1 = document.getElementById('msg1');
  if (event.keyCode === 13) {
    send();
  } else if (event.keyCode === 38) { // up
    msg1.value = pluginInterface.historyManager.getPrevious(msg1.value);
    return;
  } else if (event.keyCode === 40) { // down
    msg1.value = pluginInterface.historyManager.getNext(msg1.value);
    return;
  }
}

function loadSaves() {
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
  pluginInterface.historyManager = new HistoryManager(history, {save});
}

function throttledUpdateGfxPositions() {
  if (resizePending !== true) {
    resizePending = true;
    setTimeout(() => {
      resizePending = false;
      terminal.updateGfxPositions();
    }, 100);
  }
}

function init() {
  loadSaves();
  refreshclock();
  document.getElementById('clock1').removeAttribute('style');
  setInterval(refreshclock, 500);
  silent('/splash');

  window.addEventListener('resize', throttledUpdateGfxPositions);

  document.addEventListener('keydown', globalKeyPress);
  document.getElementById('msg1').addEventListener('keydown', msgKeyPress);
  document.getElementById('sendbut1').addEventListener('click', send);
  document.getElementById('menubut1').addEventListener('click', () => {
    loud('/splash');
    terminal.scrollLog();
  });
  [...document.getElementsByClassName('js-auto-scroll-button')].forEach(asb => {
    asb.addEventListener('click', () => terminal.scrollLog());
  });
  setInterval(() => terminal.scrollNotificationUpdate(), 1000);
  document.getElementById('msg1').focus();

}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', () => terminal.updateGfxPositions());
