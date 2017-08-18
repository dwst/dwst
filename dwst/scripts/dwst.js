
/**

  Authors: Toni Ruottu, Finland 2010-2017
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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


/*
Dark WebSocket Terminal

CC0, http://creativecommons.org/publicdomain/zero/1.0/

To the extent possible under law, Dark WebSocket Terminal developers have waived all copyright and related or neighboring rights to Dark WebSocket Terminal.

Dark WebSocket Terminal developers:
Toni Ruottu <toni.ruottu@iki.fi>, Finland 2010-2017
William Orr <will@worrbase.com>, US 2012

*/

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

  VERSION: '2.2.6',
  ECHO_SERVER_URL: 'wss://echo.websocket.org/',

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

function process(plugin, rawParam) {
  const pro = plugin.process;
  let param = rawParam;
  /* eslint-disable prefer-template */
  if (param.substr(param.length - 2, 2) === '\\\\') {
    param = param.substr(0, param.length - 2) + '\\';
  } else if (param.substr(param.length - 1, 1) === '\\') {
    param = param.substr(0, param.length - 1) + ' ';
  }
  /* eslint-enable prefer-template */
  if (typeof pro === 'undefined') {
    return param;
  }
  let instruction = 'default';
  let params = [];
  let end = '';
  if (param.substr(0, 2) === '\\\\') {
    params.push(param.substr(1));
  } else if (param.substr(0, 2) === '\\[') {
    params.push(param.substr(1));
  } else if (param.substr(0, 1) === '[') {
    const tmp = param.split(']');
    const call = tmp[0].split('[')[1];
    end = tmp[1];
    const tmp2 = call.split('(').concat('');
    instruction = tmp2[0];
    const pl = tmp2[1].split(')')[0];
    if (pl.length > 0) {
      params = pl.split(',');
    }
  } else {
    params.push(param);
  }
  return pro(instruction, params, end);
}

function run(command, ...params) {

  const plugin = pluginInterface.commands.get(command);
  if (typeof plugin === 'undefined') {
    const errorMessage = `invalid command: ${command}`;
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
  const processed = params.map(param => process(plugin, param));
  plugin.run(...processed);
}

function refreshclock() {
  const time = currenttime();
  document.getElementById('clock1').innerHTML = time;
}

function silent(line) {
  const noslash = line.substring(1);
  const parts = noslash.split(' ');
  run(...parts);
}

function loud(line) {
  terminal.log(line, 'command');
  silent(line);
}

function send() {
  const raw = document.getElementById('msg1').value;
  if (raw === '/idkfa') {
    // dwst debugger
    document.documentElement.className += ' dwst-debug';
    return;
  }
  pluginInterface.historyManager.select(raw);
  document.getElementById('msg1').value = '';
  if (raw.length < 1) {
    const helpTip = [
      'type ',
      {
        type: 'command',
        text: '/help',
      },
      ' to list available commands',
    ];
    terminal.log(helpTip, 'system');
    return;
  }
  if (raw[0] === '/') {
    loud(raw);
    return;
  }
  const replmap = [
    [' [', '\\ \\['],
    [' ', '\\ '],
  ];

  function replacer(str, rm) {
    if (rm.length < 1) {
      return str;
    }
    const head = rm[0];
    const find = head[0];
    const rep = head[1];

    const parts = str.split(find);
    const complete = [];
    for (const part of parts) {
      const loput = rm.slice(1);
      const news = replacer(part, loput);
      complete.push(news);
    }
    const out = complete.join(rep);
    return out;
  }
  const almost = replacer(raw, replmap);
  let final;
  if (almost[0] === '[') {
    final = `\\${almost}`;
  } else {
    final = almost;
  }
  const command = `/send ${final}`;
  loud(command);
  return;
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
