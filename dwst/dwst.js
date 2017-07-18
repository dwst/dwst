'use strict';

const VERSION = '2.1.0';
const ECHO_SERVER_URL = 'wss://echo.websocket.org/';
const bins = new Map();
const texts = new Map();
let resizePending = false;
let connection = null;
let intervalId = null;
let historyManager;

function range(a, b = null) {
  let start;
  let stop;
  if (b === null) {
    start = 0;
    stop = a;
  } else {
    start = a;
    stop = b;
  }
  const length = stop - start;
  return Array(length).fill().map((_, i) => start + i);
}

class Connection {

  constructor(url, protocols = []) {
    this.sessionStartTime = null;
    this.ws = (() => {
      if (protocols.length < 1) {
        return new WebSocket(url);
      }
      return new WebSocket(url, protocols);
    })();
    this.ws.onopen = this._onopen.bind(this);
    this.ws.onclose = this._onclose.bind(this);
    this.ws.onmessage = this._onmessage.bind(this);
    this.ws.onerror = this._onerror.bind(this);
  }

  _onopen() {
    this.sessionStartTime = (new Date()).getTime();
    const selected = (() => {
      if (this.ws.protocol.length < 1) {
        return [];
      }
      return [`Selected protocol: ${this.ws.protocol}`];
    })();
    mlog(['Connection established.'].concat(selected), 'system');
  }

  _onclose(e) {
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
      if (this.sessionStartTime === null) {
        return [];
      }
      const currentTime = (new Date()).getTime();
      const sessionLength = currentTime - this.sessionStartTime;
      return [`Session length: ${sessionLength}ms`];
    })();
    mlog(['Connection closed.', `Close status: ${code}`].concat(reason).concat(sessionLengthString), 'system');
  }

  _onmessage(msg) {
    if (typeof msg.data === 'string') {
      log(msg.data, 'received');
    } else {
      const fr = new FileReader();
      fr.onload = function (e) {
        const buffer = e.target.result;
        blog(buffer, 'received');
      };
      fr.readAsArrayBuffer(msg.data);
    }

  }

  _onerror() {
    log('WebSocket error.', 'error');
  }

  get url() {
    return this.ws.url;
  }

  send(...params) {
    this.ws.send(...params);
  }

  close() {
    this.ws.close();
  }

  isConnecting() {
    return this.ws.readyState === 0;
  }

  isOpen() {
    return this.ws.readyState === 1;
  }

  isClosing() {
    return this.ws.readyState === 2;
  }

  isClosed() {
    return this.ws.readyState === 3;
  }

}

class Clear {

  commands() {
    return ['clear'];
  }

  usage() {
    return [
      '/clear',
    ];
  }

  examples() {
    return [
      '/clear',
    ];
  }

  info() {
    return 'clear the screen';
  }

  run() {
    document.getElementById('ter1').innerHTML = '';
  }
}

class Texts {

  commands() {
    return ['texts'];
  }

  usage() {
    return [
      '/texts',
      '/texts [name]',
    ];
  }

  examples() {
    return [
      '/texts',
      '/texts default',
    ];
  }

  info() {
    return 'list loaded texts';
  }

  run(variable = null) {
    if (variable !== null) {
      const text = texts.get(variable);
      if (typeof text  !== 'undefined') {
        log(text, 'system');
        return;
      }
      const listTip = [
        'List available texts by typing ',
        {
          type: 'command',
          text: '/texts',
        },
        '.',
      ];
      mlog([`Text "${variable}" does not exist.`, listTip], 'error');
    }
    const listing = [...texts.entries()].map(([name, text]) => {
      return `"${name}": <${text.length}B of text data>`;
    });
    const strs = ['Loaded texts:'].concat(listing);
    mlog(strs, 'system');
  }
}

class Bins {

  commands() {
    return ['bins'];
  }

  usage() {
    return [
      '/bins [name]',
    ];
  }

  examples() {
    return [
      '/bins',
      '/bins default',
    ];
  }

  info() {
    return 'list loaded binaries';
  }

  run(variable = null) {
    if (variable !== null) {
      const buffer = bins.get(variable);
      if (typeof buffer !== 'undefined') {
        blog(buffer, 'system');
        return;
      }
      const listTip = [
        'List available binaries by typing ',
        {
          type: 'command',
          text: '/bins',
        },
        '.',
      ];
      mlog([`Binary "${variable}" does not exist.`, listTip], 'error');
      return;
    }
    const listing = [...bins.entries()].map(([name, buffer]) => {
      return `"${name}": <${buffer.byteLength}B of binary data>`;
    });
    const strs = ['Loaded binaries:'].concat(listing);
    mlog(strs, 'system');
  }
}

class Loadtext {

  commands() {
    return ['loadtext'];
  }

  usage() {
    return [
      '/loadtext [variable] [encoding]',
    ];
  }

  examples() {
    return [
      '/loadtext',
      '/loadtext default',
      '/loadtext default utf-8',
    ];
  }

  info() {
    return 'load text data from a file';
  }

  run(variable = 'default', encoding) {
    const upload = document.getElementById('file1');
    upload.onchange = () => {
      const file = upload.files[0];
      const ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      const reader = new FileReader();
      reader.onload = function (e2) {
        const text = e2.target.result;
        texts.set(variable, text);
        log(`Text file ${file.fileName} (${text.length}B) loaded to "${variable}"`, 'system');
      };
      reader.readAsText(file, encoding);
    };
    upload.click();
  }
}

class Loadbin {

  commands() {
    return ['loadbin'];
  }

  usage() {
    return [
      '/loadbin [variable]',
    ];
  }

  examples() {
    return [
      '/loadbin',
      '/loadbin default',
    ];
  }

  info() {
    return 'load binary data from a file';
  }

  run(variable = 'default') {
    const upload = document.getElementById('file1');
    upload.onchange = () => {
      const file = upload.files[0];
      const ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      const reader = new FileReader();
      reader.onload = function (e2) {
        const buffer = e2.target.result;
        bins.set(variable, buffer);
        log(`Binary file ${file.fileName} (${buffer.byteLength}B) loaded to "${variable}"`, 'system');
      };
      reader.readAsArrayBuffer(file);
    };
    upload.click();
  }
}

class Interval {

  commands() {
    return ['interval'];
  }

  usage() {
    return [
      '/interval <interval> [command line...]',
      '/interval',
    ];
  }

  examples() {
    return [
      '/interval 1000',
      '/interval 1000 /binary [random(10)]',
      '/interval',
    ];
  }

  info() {
    return 'run an other command periodically';
  }

  run(intervalStr = null, ...commandParts) {
    if (intervalStr === null) {
      if (intervalId === null) {
        log('no interval to clear', 'error');
      } else {
        clearInterval(intervalId);
        log('interval cleared', 'system');
      }
      return;
    }
    let count = 0;
    const interval = parseNum(intervalStr);
    const spammer = () => {
      if (connection === null || !connection.isOpen()) {
        if (intervalId !== null) {
          log('interval failed, no connection', 'error');
          run('interval');
        }
        return;
      }
      if (commandParts.length < 1) {
        run('send', String(count));
        count += 1;
        return;
      }
      silent(commandParts.join(' '));
    };
    if (intervalId !== null) {
      log('clearing old interval', 'system');
      clearInterval(intervalId);
    }
    intervalId = setInterval(spammer, interval);
    log('interval set', 'system');
  }
}

class Spam {

  commands() {
    return ['spam'];
  }

  usage() {
    return [
      '/spam <times> [command line...]',
    ];
  }

  examples() {
    return [
      '/spam 10',
      '/spam 6 /binary [random(10)]',
    ];
  }

  info() {
    return 'run a command multiple times in a row';
  }

  run(timesStr, ...commandParts) {
    const times = parseNum(timesStr);
    function spam(limit, i = 0) {
      if (i === limit) {
        return;
      }
      if (commandParts.length < 1) {
        run('send', String(i));
      } else {
        silent(commandParts.join(' '));
      }
      const nextspam = () => {
        spam(limit, i + 1);
      };
      if (connection !== null && connection.isOpen()) {
        setTimeout(nextspam, 0);
      } else {
        log('spam failed, no connection', 'error');
      }
    }
    spam(times);
  }
}

class Send {

  commands() {
    return ['send', 's', ''];
  }

  usage() {
    return [
      '/send [components...]',
      '/s [components...]',
    ];
  }

  examples() {
    return [
      '/send Hello\\ world!',
      '/send rpc( [random(5)] )',
      '/send [text]',
      '/send \\["JSON","is","cool"]',
      '/send [time] s\\ since\\ epoch',
      '/send From\\ a\\ to\\ z:\\ [range(97,122)]',
      '/s Available\\ now\\ with\\ 60%\\ less\\ typing!',
    ];
  }

  info() {
    return 'send textual data';
  }

  process(instr, params, postfix) {
    let out;
    if (instr === 'default') {
      out = params[0];
    }
    if (instr === 'random') {
      const randomchar = () => {
        out = Math.floor(Math.random() * (0xffff + 1));
        out /= 2; // avoid risky characters
        const char = String.fromCharCode(out);
        return char;
      };
      let num = 16;
      if (params.length === 1) {
        num = parseNum(params[0]);
      }
      let str = '';
      for (let i = 0; i < num; i++) {
        str += randomchar();
      }
      out = str;
    }
    if (instr === 'text') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      out = texts.get(variable);
    }
    if (instr === 'time') {
      out = String(Math.round(new Date().getTime() / 1000));
    }
    if (instr === 'range') {
      let start = 32;
      let end = 126;
      if (params.length === 1) {
        end = parseNum(params[0]);
      }
      if (params.length === 2) {
        start = parseNum(params[0]);
        end = parseNum(params[1]);
      }
      let str = '';
      for (let i = start; i <= end; i++) {
        str += String.fromCharCode(i);
      }
      out = str;
    }
    return out + postfix;
  }

  run(...processed) {
    const msg = processed.join('');
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      const connectTip = [
        'Use ',
        {
          type: 'dwstgg',
          text: 'connect',
          section: 'connect',
        },
        ' to form a connection and try again.',
      ];
      mlog(['No connection.', `Cannot send: ${msg}`, connectTip], 'error');
      return;
    }
    log(msg, 'sent');
    connection.send(msg);
  }
}

class Binary {

  commands() {
    return ['binary', 'b'];
  }

  usage() {
    return [
      '/binary [components...]',
      '/b [components...]',
    ];
  }

  examples() {
    return [
      '/binary Hello\\ world!',
      '/binary [random(16)]',
      '/binary [text]',
      '/binary [bin]',
      '/binary \\["JSON","is","cool"]',
      '/binary [range(0,0xff)]',
      '/binary [hex(1234567890abcdef)]',
      '/binary [hex(52)] [random(1)] lol',
      '/b Available\\ now\\ with\\ ~71.43%\\ less\\ typing!',
    ];
  }

  info() {
    return 'send binary data';
  }

  process(instr, params) {
    function byteValue(x) {
      const code = x.charCodeAt(0);
      if (code !== (code & 0xff)) { // eslint-disable-line no-bitwise
        return 0;
      }
      return code;
    }
    function hexpairtobyte(hp) {
      const hex = hp.join('');
      if (hex.length !== 2) {
        return null;
      }
      return parseInt(hex, 16);
    }
    let bytes = [];
    if (instr === 'default') {
      const text = params[0];
      bytes = [...text].map(byteValue);
    }
    if (instr === 'random') {
      const randombyte = () => {
        const out = Math.floor(Math.random() * (0xff + 1));
        return out;
      };
      let num = 16;
      if (params.length === 1) {
        num = parseNum(params[0]);
      }
      bytes = [];
      for (let i = 0; i < num; i++) {
        bytes.push(randombyte());
      }
    }
    if (instr === 'range') {
      let start = 0;
      let end = 0xff;
      if (params.length === 1) {
        end = parseNum(params[0]);
      }
      if (params.length === 2) {
        start = parseNum(params[0]);
        end = parseNum(params[1]);
      }
      bytes = [];
      for (let i = start; i <= end; i++) {
        bytes.push(i);
      }
    }
    if (instr === 'bin') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      let buffer = bins.get(variable);
      if (typeof buffer === 'undefined') {
        buffer = [];
      }
      return new Uint8Array(buffer);
    }
    if (instr === 'text') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      const text = texts.get(variable);
      if (typeof text === 'undefined') {
        bytes = [];
      } else {
        bytes = [...text].map(byteValue);
      }
    }
    if (instr === 'hex') {
      if (params.length === 1) {
        const hex = params[0];
        const nums = hex.split('');
        const pairs = divissimo(nums, 2);
        const tmp = pairs.map(hexpairtobyte);
        bytes = tmp.filter(b => (b !== null));
      } else {
        bytes = [];
      }
    }
    return new Uint8Array(bytes);
  }


  run(...buffers) {
    function joinbufs(buffersToJoin) {

      let total = 0;
      for (const buffer of buffersToJoin) {
        total += buffer.length;
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const buffer of buffersToJoin) {
        out.set(buffer, offset);
        offset += buffer.length;
      }
      return out;
    }
    const out = joinbufs(buffers).buffer;
    const msg = `<${out.byteLength}B of data> `;
    if (connection === null || connection.isClosing() || connection.isClosed()) {
      const connectTip = [
        'Use ',
        {
          type: 'dwstgg',
          text: 'connect',
          section: 'connect',
        },
        ' to form a connection and try again.',
      ];
      mlog(['No connection.', `Cannot send: ${msg}`, connectTip], 'error');
      return;
    }
    blog(out, 'sent');
    connection.send(out);
  }
}

class Splash {

  commands() {
    return ['splash'];
  }

  usage() {
    return [
      '/splash',
    ];
  }

  examples() {
    return [
      '/splash',
    ];
  }

  info() {
    return 'revisit welcome screen';
  }

  run() {

    /* eslint-disable quotes,object-property-newline */

    const SPLASH = [
      [
        // ".        ..        ..        ..        ..        ..        ..        ..        ..        ..        ..        .",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                   `ggg.                                                                      ",
        "                                     ggg                                                                      ",
        "                                      gg.                                                                     ",
        "                                       gg                                 ggg'                                ",
        "                                       gg                                 gg                                  ",
        "                                   ,ggg g.  ggg       ggg.   .gggggg.     g                                   ",
        "                                 ,gg  `ggg ggg         ggg. gg      `g.  gg                                   ",
        "                                 gg     gg.g'           `gg gg.       `gggggg'                                ",
        "                                 gg     ggg'             gg. 'gggggg.  ,g                                     ",
        "                                 ll.     ll.     ,l.      ll       `ll l.                                     ",
        "                                  ll.   llll.   ,lll.   ,ll l`     ,ll ll.                                    ",
        "                                   `lllll' `lllll' `lllll'  `lllllll'   lll.                                  ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
      ],
      [
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                   11111                                                                      ",
        "                                     111                                                                      ",
        "                                      111                                                                     ",
        "                                       11                                 1111                                ",
        "                                       11                                 11                                  ",
        "                                   1111 11  111       1111   11111111     1                                   ",
        "                                 111  1111 111         1111 11      111  11                                   ",
        "                                 11     11111           111 111       11111111                                ",
        "                                 11     1111             111 11111111  11                                     ",
        "                                 222     222     222      22       222 22                                     ",
        "                                  222   22222   22222   222 22     222 222                                    ",
        "                                   2222222 2222222 2222222  222222222   2222                                  ",
        "                                                                                                              ",
        "                                                                                                              ",
        "                                                                                                              ",
      ],
    ];
    /*
    const xmasColors = [
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                    xxxx                                                                      ",
      "                                     111                                                                      ",
      "                                      11x                                                                     ",
      "                                       11                                 xxxx                                ",
      "                                       11                                 11                                  ",
      "                                   xxx1 11  xxx       xxxx   xxxxxxxx     1                                   ",
      "                                 xx1  1111 111         111x x1      1xx  x1                                   ",
      "                                 11     11111           111 111       1xx11111                                ",
      "                                 11     1111             11x 11111111  11                                     ",
      "                                 222     222     222      22       222 22                                     ",
      "                                  222   22222   22222   222 22     222 222                                    ",
      "                                   2222222 2222222 2222222  222222222   2222                                  ",
      "                                                                                                              ",
      "                                                                                                              ",
      "                                                                                                              ",
    ];
    */

    /* eslint-enable quotes,object-property-newline */

    const CONNECTION_LIST_CAP = 3;
    const historyLength = historyManager.getHistoryLength();
    const historySummary = historyManager.getSummary();
    const maybeTooManyConnectCommands =  historyManager.getConnectCommands(CONNECTION_LIST_CAP + 1);
    const connectCommands = maybeTooManyConnectCommands.slice(0, CONNECTION_LIST_CAP);
    const connectionsLines = connectCommands.map(command => {
      return {
        type: 'command',
        text: command,
      };
    });
    const tooManyWarning = (() => {
      if (maybeTooManyConnectCommands.length > CONNECTION_LIST_CAP) {
        return [`(more than ${CONNECTION_LIST_CAP} in total, hiding some)`];
      }
      return [];
    })();
    const historySection = (() => {
      if (historyLength < 1) {
        return [];
      }
      const forgetAdvertisement = [
        'Type ',
        {
          type: 'strong',
          text: '/forget everything',
        },
        ' to remove all stored history',
      ];
      if (connectCommands.length < 1) {
        return [
          '',
          historySummary.concat(['.']),
          '',
          forgetAdvertisement,
        ];
      }
      return [
        '',
        historySummary.concat([
          ', including the following ',
          {
            type: 'dwstgg',
            text: 'connect',
            section: 'connect',
          },
          ' commands',
        ]),
      ].concat(connectionsLines).concat(tooManyWarning).concat([
        '',
        forgetAdvertisement,
      ]);
    })();
    const about = [
      [
        'Dark WebSocket Terminal ',
        {
          type: 'strong',
          text: `${VERSION}`,
        },
      ],
    ];
    const beginnerInfo = [
      '',
      [
        '1. Connect to a server (type ',
        {
          type: 'command',
          text: `/connect ${ECHO_SERVER_URL}`,
        },
        ' for example)',
      ],
      [
        '2. Type text into the box below to send messages',
      ],
      [
        '3. Disconnect by hitting the Escape key on your keyboard',
      ],
    ];
    const maybeBeginnerInfo = (() => {
      if (connectCommands.length < 1) {
        return beginnerInfo;
      }
      return [];
    })();
    const helpReminder = [
      '',
      [
        'Type ',
        {
          type: 'command',
          text: '/help',
        },
        ' to see the full range of available commands',
      ],
    ];
    const sections = [
      about,
      maybeBeginnerInfo,
      helpReminder,
      historySection,
      [''],
    ];
    gfx(...SPLASH);
    mlog([].concat(...sections), 'system');
  }

}


class Forget {

  commands() {
    return ['forget'];
  }

  usage() {
    return [
      '/forget everything',
    ];
  }

  examples() {
    return [
      '/forget everything',
    ];
  }

  info() {
    return 'empty history';
  }

  run(target) {
    if (target === 'everything') {
      historyManager.forget();
    } else {
      const historyLine = historyManager.getSummary().concat(['.']);
      mlog([`Invalid argument: ${target}`, historyLine], 'error');
      return;
    }
    const historyLine = historyManager.getSummary().concat(['.']);
    mlog([`Successfully forgot ${target}!`, historyLine], 'system');
  }

}


class Help {

  commands() {
    return ['help'];
  }

  usage() {
    return [
      '/help',
      '/help <command>',
    ];
  }

  examples() {
    return [
      '/help',
      '/help send',
      '/help binary',
    ];
  }

  info() {
    return 'get help';
  }

  run(command = null) {
    if (command !== null) {
      const plugin = commands.get(command);
      if (typeof plugin === 'undefined') {
        log(`the command does not exist: ${command}`, 'error');
        return;
      }
      if (typeof plugin.usage === 'undefined') {
        log(`no help available for: ${command}`, 'system');
        return;
      }
      const breadCrumbs = [
        {
          type: 'dwstgg',
          text: 'DWSTGG',
        },
        {
          type: 'regular',
          text: ' &raquo; ',
          unsafe: true,
        },
        {
          type: 'dwstgg',
          text: `${command}`,
          section: `${command}`,
        },
      ];
      const info = plugin.info();
      const title = [
        {
          type: 'strong',
          text: `${command}`,
        },
        {
          type: 'regular',
          text: ' &ndash; ',
          unsafe: true,
        },
        info,
      ];
      const usageItems = plugin.usage().map(usage => {
        return {
          type: 'syntax',
          text: usage,
        };
      });
      const usage = formatList('Usage', usageItems);
      const examplesItems = plugin.examples().map(exampleCommand => {
        return {
          type: 'command',
          text: exampleCommand,
        };
      });

      const examplesTitle = (() => {
        if (examplesItems.length < 2) {
          return 'Example';
        }
        return 'Examples';
      })();
      const examples = formatList(examplesTitle, examplesItems);
      const help = [breadCrumbs, '', title, ''].concat(usage).concat(['']).concat(examples).concat(['']);
      mlog(help, 'system');
      return;
    }
    const available = [];
    [...commands.keys()].sort().forEach(c => {
      if (c.length > 1) {
        const commandSegment = {
          type: 'dwstgg',
          text: c,
          section: c,
          spacing: true,
        };
        available.push(commandSegment);
      }
    });
    available.sort();

    const commandsList = [flatList('Commands', available)];

    mlog([
      {
        type: 'strong',
        text: 'DWST Guide to Galaxy',
      },
      '',
      [
        'Type ',
        {
          type: 'syntax',
          text: '/help <command>',
        },
        ' for instructions.',
      ],
      '',
    ].concat(commandsList).concat([
      '',
    ]), 'system');
  }
}

class Connect {

  commands() {
    return ['connect'];
  }

  usage() {
    return [
      '/connect <ws-url> [protocol1[,protocol2[,...[,protocolN]]]]',
    ];
  }

  examples() {
    return [
      '/connect wss://echo.websocket.org/',
      '/connect ws://echo.websocket.org/',
      '/connect ws://127.0.0.1:1234/ p1.example.com,p2.example.com',
    ];
  }

  info() {
    return 'connect to a server';
  }

  run(url, protocolString = '') {
    const protoCandidates = (() => {
      if (protocolString === '') {
        return [];
      }
      return protocolString.split(',');
    })();
    const protocols = protoCandidates.filter(protocolName => {

      // https://tools.ietf.org/html/rfc6455#page-17

      const basicAlphabet = range(0x21, 0x7e).map(charCode => String.fromCharCode(charCode));
      const httpSeparators = new Set([...'()<>@,;:\\"/[]?={} \t']);
      const validProtocolChars = new Set(basicAlphabet.filter(character => !httpSeparators.has(character)));
      const usedChars = [...protocolName];
      const invalidCharsSet = new Set(usedChars.filter(character => !validProtocolChars.has(character)));
      const invalidChars = [...invalidCharsSet];
      if (invalidChars.length > 0) {
        const invalidCharsString = invalidChars.map(character => `"${character}"`).join(', ');
        mlog([`Skipped invalid protocol candidate "${protocolName}".`, `The following characters are not allowed: ${invalidCharsString}`], 'warning');
        return false;
      }
      return true;
    });
    connection = new Connection(url, protocols);
    const protoFormatted = protocols.join(', ');
    const negotiation = (() => {
      if (protocols.length < 1) {
        return ['No protocol negotiation.'];
      }
      return [`Accepted protocols: ${protoFormatted}`];
    })();
    mlog([`Connecting to ${connection.url}`].concat(negotiation), 'system');
  }
}

class Disconnect {

  commands() {
    return ['disconnect'];
  }

  usage() {
    return [
      '/disconnect',
    ];
  }

  examples() {
    return [
      '/disconnect',
    ];
  }

  info() {
    return 'disconnect from a server';
  }

  run() {
    const protocol = [];
    mlog([`Closing connection to ${connection.url}`].concat(protocol), 'system');
    connection.close();
  }
}

const plugins = [Connect, Disconnect, Splash, Forget, Help, Send, Spam, Interval, Binary, Loadbin, Bins, Clear, Loadtext, Texts];
const commands = new Map();

for (const Constructor of plugins) {
  const plugin = new Constructor();
  for (const command of plugin.commands()) {
    commands.set(command, plugin);
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

  const plugin = commands.get(command);
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
    mlog([errorMessage, helpTip], 'error');
    return;
  }
  const processed = params.map(param => process(plugin, param));
  plugin.run(...processed);
}


function refreshclock() {
  const time = currenttime();
  document.getElementById('clock1').innerHTML = time;
}

function currenttime() {
  const addzero = function (i) {
    if (i < 10) {
      return `0${i}`;
    }
    return String(i);
  };
  const date = new Date();
  const time = `${addzero(date.getHours())}:${addzero(date.getMinutes())}<span class="sec">:${addzero(date.getSeconds())}</span>`;
  return time;

}

function htmlescape(line) {
  return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseNum(str) {
  if (str.length > 2 && str.substr(0, 2) === '0x') {
    return parseInt(str.substr(2), 16);
  }
  const num = parseInt(str, 10);
  return num;
}

function log(line, type) {
  mlog([line], type);
}

function mlog(lines, type) {
  const lineElements = lines.map(rawLine => {
    let line;
    if (typeof rawLine === 'string') {
      line = [rawLine];
    } else if (typeof rawLine === 'object' && !Array.isArray(rawLine)) {
      line = [rawLine];
    } else {
      line = rawLine;
    }
    if (!Array.isArray(line)) {
      throw new Error('error');
    }
    const htmlSegments = line.map(rawSegment => {
      let segment;
      if (typeof rawSegment === 'string') {
        segment = {
          type: 'regular',
          text: rawSegment,
        };
      } else {
        segment = rawSegment;
      }
      if (typeof segment === 'object') {
        const rawText = segment.text;
        const safeText = (() => {
          if (segment.hasOwnProperty('unsafe') && segment.unsafe === true) {
            return rawText;
          }
          return htmlescape(rawText);
        })();

        if (segment.type === 'regular') {
          const textSpan = document.createElement('span');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'dwstgg') {
          const linkWrapper = document.createElement('span');
          linkWrapper.setAttribute('class', 'dwst-mlog__help-link-wrapper');
          const link = document.createElement('a');
          const classes = ['dwst-mlog__help-link'];
          if (segment.spacing === true) {
            classes.push('dwst-mlog__help-link--spacing');
          }
          link.setAttribute('class', classes.join(' '));
          const command = (() => {
            if (segment.hasOwnProperty('section')) {
              return `/help ${segment.section}`;
            }
            return '/help';
          })();
          link.onclick = () => {
            loud(command);
          };
          link.setAttribute('href', '#');
          link.setAttribute('title', command);
          const textSpan = document.createElement('span');
          textSpan.innerHTML = safeText;
          link.appendChild(textSpan);
          linkWrapper.appendChild(link);
          if (segment.hasOwnProperty('afterText')) {
            const afterTextNode = document.createTextNode(segment.afterText);
            linkWrapper.appendChild(afterTextNode);
          }
          return linkWrapper;
        }
        if (segment.type === 'command') {
          const link = document.createElement('a');
          link.setAttribute('class', 'dwst-mlog__command-link');
          const command = rawText;
          link.onclick = () => {
            historyManager.select(command);
            loud(command);
          };
          link.setAttribute('href', '#');
          link.setAttribute('title', safeText);
          const textSpan = document.createElement('span');
          textSpan.innerHTML = safeText;
          link.appendChild(textSpan);
          return link;
        }
        if (segment.type === 'hexline') {
          const hexChunks = divissimo(segment.hexes, 4);
          const textChunks = divissimo(rawText, 4);

          const byteGrid = document.createElement('div');
          byteGrid.setAttribute('class', 'dwst-bytegrid');

          hexChunks.forEach((hexChunk, i) => {
            const textChunk = textChunks[i];

            const hexContent = htmlescape(hexChunk.join(' '));
            const hexItem = document.createElement('div');
            hexItem.setAttribute('class', 'dwst-bytegrid_item');
            hexItem.innerHTML = hexContent;
            byteGrid.appendChild(hexItem);

            const textContent = htmlescape(textChunk.join(''));
            const textItem = document.createElement('div');
            textItem.setAttribute('class', 'dwst-bytegrid_item');
            textItem.innerHTML = textContent;
            byteGrid.appendChild(textItem);
          });

          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__hexline');
          textSpan.appendChild(byteGrid);
          return textSpan;
        }
        if (segment.type === 'strong') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__strong');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'syntax') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__syntax');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
      }
      throw new Error('unknown segment type');
    });
    return htmlSegments;
  });
  const time = currenttime();
  const terminal1 = document.getElementById('ter1');
  const logLine = document.createElement('div');
  logLine.setAttribute('class', 'dwst-logline');
  logLine.innerHTML = `<span class="dwst-logline__item time">${time}</span><span class="dwst-logline__item dwst-direction dwst-direction--${type}">${type}:</span>`;
  const outputCell = document.createElement('span');
  outputCell.setAttribute('class', 'dwst-logline__item dwst-logline__item--main preserved');
  lineElements.forEach(lineElement => {
    lineElement.forEach(segmentElement => {
      outputCell.appendChild(segmentElement);
    });
    const br = document.createElement('br');
    outputCell.appendChild(br);
  });
  logLine.appendChild(outputCell);
  terminal1.appendChild(logLine);
  const screen = document.getElementById('screen1');
  screen.scrollTop = screen.scrollHeight;
}

function gfx(lines, colors) {

  const gfxContent = document.createElement('div');
  gfxContent.setAttribute('class', 'dwst-gfx__content');
  lines.forEach((line, li) => {
    const logLine = document.createElement('div');
    logLine.setAttribute('class', 'dwst-gfx__line');
    [...line].forEach((chr, ci) => {
      const color = colors[li][ci];
      const outputCell = document.createElement('span');
      outputCell.setAttribute('class', `dwst-gfx__element dwst-gfx__element--color-${color}`);
      outputCell.innerHTML = chr;
      logLine.appendChild(outputCell);
    });
    gfxContent.appendChild(logLine);
  });

  const gfxContainer = document.createElement('div');
  gfxContainer.setAttribute('class', 'dwst-gfx');
  gfxContainer.appendChild(gfxContent);

  const terminal1 = document.getElementById('ter1');
  terminal1.appendChild(gfxContainer);
  const screen = document.getElementById('screen1');
  screen.scrollTop = screen.scrollHeight;

  updateGfxPositions();
}

function divissimo(l, n) {
  const chunks = [];
  let chunk = [];
  let i = 0;
  for (const b of l) {
    if (i >= n) {
      chunks.push(chunk);
      chunk = [];
      i = 0;
    }
    chunk.push(b);
    i += 1;
  }
  chunks.push(chunk);
  return chunks;
}

function hexdump(buffer) {
  function hexify(num) {
    const hex = num.toString(16);
    if (hex.length < 2) {
      return `0${hex}`;
    }
    return hex;
  }
  function charify(num) {
    if (num > 0x7e || num < 0x20) { // non-printable
      return '.';
    }
    return String.fromCharCode(num);
  }
  const dv = new DataView(buffer);
  let offset = 0;
  const lines = [];
  while (offset < buffer.byteLength) {
    let text = '';
    const hexes = [];
    for (let i = 0; i < 16; i++) {
      if (offset < buffer.byteLength) {
        const oneByte = dv.getUint8(offset);
        const asChar = charify(oneByte);
        const asHex = hexify(oneByte);
        text += asChar;
        hexes.push(asHex);
      }
      offset += 1;
    }
    lines.push({
      text,
      hexes,
    });

  }
  return lines;
}

function formatList(listTitle, lines) {
  const titlePrefix = `${listTitle}: `;
  const spacePrefix = new Array(titlePrefix.length + 1).join(' ');
  return lines.map((line, i) => {
    const prefix = (() => {
      if (i === 0) {
        return titlePrefix;
      }
      return spacePrefix;
    })();
    if (Array.isArray(line)) {
      return [prefix].concat(line);
    }
    return [prefix, line];
  });
}

function flatList(listTitle, values) {
  const segments = [];
  segments.push(listTitle);
  segments.push(': ');
  values.forEach(value => {
    value.afterText = ',';
    segments.push(value);
    segments.push(' ');
  });
  segments.pop();  // remove extra space
  const last = segments.pop();
  Reflect.deleteProperty(last, 'afterText');
  segments.push(last);
  return segments;
}

function blog(buffer, type) {
  const msg = `<${buffer.byteLength}B of binary data>`;
  const hd = hexdump(buffer);
  const hexLines = hd.map(line => {
    return {
      type: 'hexline',
      text: line.text,
      hexes: line.hexes,
    };
  }
  );
  mlog([msg].concat(hexLines), type);
}

function silent(line) {
  const noslash = line.substring(1);
  const parts = noslash.split(' ');
  run(...parts);
}

function loud(line) {
  log(line, 'command');
  silent(line);
}

function send() {
  const raw = document.getElementById('msg1').value;
  if (raw === '/idkfa') {
    // dwst debugger
    document.documentElement.className += ' dwst-debug';
    return;
  }
  historyManager.select(raw);
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
    log(helpTip, 'system');
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

class ElementHistory {

  constructor(history = []) {
    if (!Array.isArray(history)) {
      throw new Error('invalid history saveState');
    }
    this.idx = -1;
    this.history = history;
  }

  get length() {
    return this.history.length;
  }

  getAll() {
    return this.history;
  }

  getNext() {
    if (this.idx > 0) {
      this.idx -= 1;
      return this.history[this.idx];
    }
    if (this.idx === 0) {
      this.idx -= 1;
      return '';
    }

    return '';
  }

  getPrevious() {
    if (this.history.length === 0) {
      return '';
    }
    if (this.idx + 1 < this.history.length) {
      this.idx += 1;
      return this.history[this.idx];
    }
    return this.history[this.history.length - 1];
  }

  gotoBottom() {
    this.idx = -1;
  }

  getLast() {
    return this.history[0];
  }

  addItem(item, edition, callback) {
    if (typeof item !== 'string') {
      throw new Error('invalid type');
    }
    if (item !== '' && item !== this.getLast()) {
      this.history.unshift(item);
      if (edition) {
        this.idx += 1;
      }
    }
    callback();
  }

  removeBottom() {
    this.history.shift();
  }

  getCurrent() {
    return this.history[this.idx];
  }

  getConnectCommands(cap) {
    const uniqueCommands = [];
    const commandsSet = new Set();
    for (const command of this.history) {
      if (command.startsWith('/connect ') && !commandsSet.has(command)) {
        uniqueCommands.push(command);
        commandsSet.add(command);
      }
      if (uniqueCommands.length >= cap) {
        return uniqueCommands;
      }
    }
    return uniqueCommands;
  }

}

class HistoryManager {

  constructor(savedHistory, options) {
    this.save = options.save;
    this.history = new ElementHistory(savedHistory);
  }

  getHistoryLength() {
    return this.history.length;
  }

  getSummary() {
    const history = this.history.getAll();
    const historyLine = ['History '];
    if (history.length < 1) {
      historyLine.push('is empty');
    } else {
      historyLine.push('contains ');
      historyLine.push({
        type: 'strong',
        text: `${history.length}`,
      });
      if (history.length === 1) {
        historyLine.push(' command');
      } else {
        historyLine.push(' commands');
      }
    }
    return historyLine;
  }

  forget() {
    const emptyHistory = [];
    this.history = new ElementHistory(emptyHistory, {save: this.save});
    this.save(emptyHistory);
  }

  addItem(value, edition) {
    this.history.addItem(value, edition, () => {
      const history = this.history.getAll();
      this.save(history);
    });
  }

  getNext(value) {
    if (value !== this.history.getCurrent()) {
      this.addItem(value, true);
    }
    return this.history.getNext();
  }

  getPrevious(value) {
    if (value !== this.history.getCurrent()) {
      this.addItem(value, true);
    }
    return this.history.getPrevious();
  }

  select(value) {
    this.addItem(value);
    this.history.gotoBottom();
  }

  atBottom() {
    return this.history.idx === -1;
  }

  getConnectCommands(cap) {
    return this.history.getConnectCommands(cap);
  }
}

function globalKeyPress(event) {
  const msg1 = document.getElementById('msg1');
  if (event.key === 'Escape') {
    if (connection !== null && (connection.isOpen() || connection.isConnecting())) {
      loud('/disconnect');
    } else if (msg1.value === '') {
      const connects = historyManager.getConnectCommands(1);
      if (connects.length < 1) {
        msg1.value = `/connect ${ECHO_SERVER_URL}`;
      } else {
        msg1.value = connects[0];
      }
    } else {
      historyManager.select(msg1.value);
      msg1.value = '';
    }
  }
}

function msgKeyPress(event) {
  const msg1 = document.getElementById('msg1');
  if (event.keyCode === 13) {
    send();
  } else if (event.keyCode === 38) { // up
    msg1.value = historyManager.getPrevious(msg1.value);
    return;
  } else if (event.keyCode === 40) { // down
    msg1.value = historyManager.getNext(msg1.value);
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
  historyManager = new HistoryManager(history, {save});
}

function updateGfxPositions() {
  // Updating gfx positions with this method disables basic centering
  // and aligns the text in the gfx section with the text in log lines.
  const MAX_MAXCHARS = 110;
  Reflect.apply(Array.prototype.forEach, document.getElementsByClassName('dwst-gfx'), [maxDiv => {
    const ref = maxDiv.getElementsByClassName('dwst-gfx__line')[0];
    const refTextWidth = ref.offsetWidth;
    const refTextLength = ref.textContent.length;
    const refWidth = refTextWidth / refTextLength;
    const windowWidth = window.innerWidth;
    const maxFit = Math.floor(windowWidth / refWidth);
    let leftMargin = 0;
    if (maxFit < MAX_MAXCHARS) {
      const invisible = MAX_MAXCHARS - maxFit;
      const invisibleLeft = Math.floor(invisible / 2);
      leftMargin -= invisibleLeft;
    }
    const field = maxDiv.getElementsByClassName('dwst-gfx__content')[0];
    field.setAttribute('style', `transform: initial; margin-left: ${leftMargin}ch;`);
  }]);
}

function throttledUpdateGfxPositions() {
  if (resizePending !== true) {
    resizePending = true;
    setTimeout(() => {
      resizePending = false;
      updateGfxPositions();
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
  });
  document.getElementById('msg1').focus();

}

document.addEventListener('DOMContentLoaded', init);
