'use strict';

/*
Dark WebSocket Terminal

CC0, http://creativecommons.org/publicdomain/zero/1.0/

To the extent possible under law, Dark WebSocket Terminal developers have waived all copyright and related or neighboring rights to Dark WebSocket Terminal.

Dark WebSocket Terminal developers:
Toni Ruottu <toni.ruottu@iki.fi>, Finland 2010-2017
William Orr <will@worrbase.com>, US 2012

*/

const VERSION = '2.2.6';
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

class FakeSocket {
  constructor(url) {
    this.url = url;
    this.protocol = '';
    this.readyState = 1;
    this._path = url.split('//').pop();
    window.setTimeout(() => {
      this.onopen();
    }, 0);
  }

  send(message) {
    if (this._path === 'echo') {
      const data = (() => {
        if (typeof message === 'string') {
          return message;
        }
        if (message instanceof ArrayBuffer) {
          return new Blob([new Uint8Array(message)]);
        }
        throw new Error('Unexpected message type');
      })();
      window.setTimeout(() => {
        this.onmessage({
          data,
        });
      }, 0);
    }
  }

  close() {
    this.readyState = 3;
    this.onclose({
      code: 1000,
      reason: '',
    });
  }
}

class Connection {

  constructor(url, protocols = []) {
    this.sessionStartTime = null;
    this.ws = (() => {
      const SocketConstructor = (() => {
        if (url.startsWith('dwst://')) {
          return FakeSocket;
        }
        return WebSocket;
      })();
      if (protocols.length < 1) {
        return new SocketConstructor(url);
      }
      return new SocketConstructor(url, protocols);
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
    connection = null;
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

  get verb() {
    const readyState = this.ws.readyState;
    if (readyState === 0) {
      return 'connecting';
    }
    if (readyState === 1) {
      return 'connected';
    }
    if (readyState === 2) {
      return 'closing connection';
    }
    if (readyState === 3) {
      return 'hanging on an already closed connection';
    }
    throw new Error('Unkown readyState');
  }

  get protocol() {
    return this.ws.protocol;
  }

  send(...params) {
    if (this.ws.readyState !== 1) {
      log(`Attempting to send data while ${this.verb}`, 'warning');
    }
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

class Reset {

  commands() {
    return ['reset'];
  }

  usage() {
    return [
      '/reset',
    ];
  }

  examples() {
    return [
      '/reset',
    ];
  }

  info() {
    return 'reset the message buffer';
  }

  run() {
    document.getElementById('ter1').innerHTML = '';
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
    clearLog();
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
    return 'run a command multiple times';
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

    clearLog();

    /* eslint-disable quotes,object-property-newline */

    const SPLASH = [
      [
        // ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
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
        "                                   fffff                                                                      ",
        "                                     fff                                                                      ",
        "                                      fff                                                                     ",
        "                                       ff                                 ffff                                ",
        "                                       ff                                 ff                                  ",
        "                                   ffff ff  fff       ffff   ffffffff     f                                   ",
        "                                 fff  ffff fff         ffff ff      fff  ff                                   ",
        "                                 ff     fffff           fff fff       ffffffff                                ",
        "                                 ff     ffff             fff ffffffff  ff                                     ",
        "                                 555     555     555      55       555 55                                     ",
        "                                  555   55555   55555   555 55     555 555                                    ",
        "                                   5555555 5555555 5555555  555555555   5555                                  ",
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
    const historySection = ([
      historySummary.concat([
        ', including ',
        {
          type: 'dwstgg',
          text: 'connect',
          section: 'connect',
        },
        ' commands',
      ]),
    ]).concat(
      connectionsLines,
    ).concat(
      tooManyWarning,
    );
    const statusSection = (() => {
      if (connection === null) {
        return [];
      }
      const connectionStatus = [
        'Currently ',
        connection.verb,
        ' to ',
        {
          type: 'strong',
          text: connection.url,
        },
      ];
      const maybeProtocolStatus = (() => {
        const protocol = connection.protocol;
        if (protocol.length < 1) {
          return [];
        }
        return [
          [
            'Selected protocol: ',
            {
              type: 'strong',
              text: protocol,
            },
          ],
        ];
      })();
      const disconnectInstructions = [
        'Type ',
        {
          type: 'command',
          text: '/disconnect',
        },
        ' to end the connection',
      ];
      return ([
        connectionStatus,
      ]).concat(maybeProtocolStatus).concat([
        '',
        disconnectInstructions,
      ]);
    })();
    const about = [
      [
        {
          type: 'h1',
          text: `Dark WebSocket Terminal ${VERSION}`,
        },
      ],
    ];
    const beginnerInfo = [
      [
        '1. Create a test connection by typing ',
        {
          type: 'command',
          text: `/connect ${ECHO_SERVER_URL}`,
        },
      ],
      [
        '2. Type messages into the text input',
      ],
      [
        '3. Click on DWST logo if you get lost',
      ],
    ];
    const helpReminder = [
      [
        'Type ',
        {
          type: 'command',
          text: '/help',
        },
        ' to see the full range of available commands',
      ],
    ];
    const privacyReminder = [
      [
        {
          type: 'dwstgg',
          text: 'Check',
          section: '#privacy',
          warning: true,
        },
        ' privacy and tracking info',
      ],
    ];
    const linkSection = [
      [
        {
          type: 'link',
          text: 'GitHub',
          url: 'https://github.com/dwst/dwst',
        },
        {
          type: 'regular',
          text: ' &bull; ',
          unsafe: true,
        },
        {
          type: 'link',
          text: 'chat',
          url: 'https://gitter.im/dwst/dwst',
        },
        {
          type: 'regular',
          text: ' &bull; ',
          unsafe: true,
        },
        {
          type: 'link',
          text: 'rfc6455',
          url: 'https://tools.ietf.org/html/rfc6455',
        },
        {
          type: 'regular',
          text: ' &bull; ',
          unsafe: true,
        },
        {
          type: 'link',
          text: 'iana',
          url: 'https://www.iana.org/assignments/websocket/websocket.xhtml',
        },
      ],
    ];
    const sections = (() => {
      if (connection !== null) {
        return [
          about,
          [''],
          statusSection,
          [''],
          helpReminder,
          [''],
          linkSection,
        ];
      }
      if (connectCommands.length > 0) {
        return [
          about,
          [''],
          historySection,
          [''],
          privacyReminder,
          [''],
          helpReminder,
          [''],
          linkSection,
        ];
      }
      return [
        about,
        [''],
        beginnerInfo,
        [''],
        privacyReminder,
        [''],
        helpReminder,
        [''],
        linkSection,
      ];
    })();
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

  _removeHistory() {
    historyManager.forget();
    const historyLine = historyManager.getSummary().concat(['.']);
    mlog(['Successfully forgot stored history!', historyLine], 'system');
  }

  run(target) {
    if (target === 'everything') {
      this._removeHistory();
      log("You may wish to use your browser's cleaning features to remove tracking cookies and other remaining traces.", 'warning');
    } else {
      const historyLine = historyManager.getSummary().concat(['.']);
      mlog([`Invalid argument: ${target}`, historyLine], 'error');
    }
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

  _createBreadCrumbs(section = null) {
    const root = [
      {
        type: 'dwstgg',
        text: 'DWSTGG',
      },
    ];
    if (section === null) {
      return root;
    }
    return root.concat([
      {
        type: 'regular',
        text: ' &raquo; ',
        unsafe: true,
      },
      {
        type: 'dwstgg',
        text: `${section}`,
        section: `${section}`,
      },
    ]);
  }

  _mainHelp() {
    const available = [];
    [...commands.keys()].sort().forEach(c => {
      if (c.length > 1) {
        const commandSegment = {
          type: 'dwstgg',
          text: c,
          section: c,
          spacing: true,
          wrap: false,
        };
        available.push(commandSegment);
      }
    });

    const commandsList = [flatList(available)];

    mlog([
      this._createBreadCrumbs(),
      '',
      {
        type: 'h1',
        text: 'DWST Guide to Galaxy',
      },
      '',
      'DWSTGG is here to help you get the most out of Dark WebSocket Terminal',
      '',
      {
        type: 'h2',
        text: 'Topics',
      },
      '',
      [
        '- Working with ',
        {
          type: 'dwstgg',
          text: '#unprotected',
          section: '#unprotected',
        },
        ' sockets',
      ],
      [
        '- Running the ',
        {
          type: 'dwstgg',
          text: '#development',
          section: '#development',
        },
        ' server',
      ],
      [
        '- ',
        {
          type: 'dwstgg',
          text: '#privacy',
          section: '#privacy',
        },
        ' and tracking information',
      ],
      '',
      [
        'Open with ',
        {
          type: 'syntax',
          text: '/help #<keyword>',
        },
      ],
      '',
      {
        type: 'h2',
        text: 'Commands',
      },
      '',
    ].concat(commandsList).concat([
      [
        'Type ',
        {
          type: 'syntax',
          text: '/help <command>',
        },
        ' for instructions',
      ],
      '',
    ]), 'system');
  }

  _helpPage(page) {

    const disclaimer = [
      {
        type: 'h2',
        text: '!!! Follow at your own risk !!!',
      },
      '',
      'Disabling security is generally a bad idea and you should only do it if you understand the implications.',
    ];

    if (page === '#chrome') {
      mlog(([
        this._createBreadCrumbs(page),
        '',
        {
          type: 'h1',
          text: 'Insecure WebSocket Access in Chrome',
        },
        '',
        [
          'Chrome lets you temporarily bypass the security feature that prevents you from connecting to ',
          {
            type: 'dwstgg',
            text: '#unprotected',
            section: '#unprotected',
          },
          ' WebSockets.',
        ],
        '',
      ]).concat(disclaimer).concat([
        '',
        {
          type: 'h2',
          text: 'Instructions',
        },
        '',
        [
          '1. Use ',
          {
            type: 'dwstgg',
            text: 'connect',
            section: 'connect',
          },
          ' on a ws:// address',
        ],
        '2. Look for a shield icon',
        '3. Click on the shield icon',
        '4. Click "Load unsafe scripts"',
        '5. Use connect again',
        '',
      ]), 'system');
      return;
    }
    if (page === '#firefox') {
      mlog(([
        this._createBreadCrumbs(page),
        '',
        {
          type: 'h1',
          text: 'Insecure WebSocket Access in Firefox',
        },
        '',
        [
          'Firefox lets you disable the security feature that prevents you from connecting to ',
          {
            type: 'dwstgg',
            text: '#unprotected',
            section: '#unprotected',
          },
          ' WebSockets.',
        ],
        '',
      ]).concat(disclaimer).concat([
        '',
        {
          type: 'h2',
          text: 'Instructions',
        },
        '',
        '1. Go to about:config',
        '2. Search for WebSocket',
        '3. Set allowInsecureFromHTTPS to true',
        '',
      ]), 'system');
      return;
    }
    if (page === '#development') {
      const commands = [
        'git clone https://github.com/dwst/dwst.git',
        'cd dwst',
        'npm install',
        'gulp dev',
      ];
      const commandSegments = commands.map(c => {
        return {
          type: 'code',
          text: c,
        };
      });
      mlog(([
        this._createBreadCrumbs(page),
        '',
        {
          type: 'h1',
          text: 'DWST Development Server',
        },
        '',
        'You can run DWST development server by executing the following commands in the shell near you.',
        '',
      ]).concat(commandSegments).concat([
        '',
        [
          'This is useful if you wish to customise DWST on source code level but can also be used to access ',
          {
            type: 'dwstgg',
            text: '#unprotected',
            section: '#unprotected',
          },
          ' WebSockets.',
        ],
        '',
      ]), 'system');
      return;
    }
    if (page === '#unprotected') {
      mlog([
        this._createBreadCrumbs(page),
        '',
        {
          type: 'h1',
          text: 'Working with Unprotected WebSockets',
        },
        '',
        [
          'Browsers tend to prevent unprotected WebSockets connections from secure origins. ',
          'You may encounter this problem if your target WebSocket address starts with',
          {
            type: 'strong',
            text: ' ws://',
          },
        ],
        '',
        {
          type: 'h2',
          text: 'Use wss INSTEAD',
        },
        '',
        [
          'The most straight forward fix is to use the secure address instead. ',
          'However, the server needs to accept secure connections for this to work.',
        ],
        '',
        {
          type: 'h2',
          text: 'Use Dev Server',
        },
        '',
        [
          'The connection restrictions apply to DWST since it is served over https. ',
          'You can work around the problem by setting up the DWST ',
          {
            type: 'dwstgg',
            text: '#development',
            section: '#development',
          },
          ' server on your local work station.',
        ],
        '',
        {
          type: 'h2',
          text: 'Disable Security',
        },
        '',
        [
          'Finally, you have the option of disabling related browser security features. ',
          'However, doing this will screw up your security and release testing. ',
          'Nevertheless we have instructions for ',
          {
            type: 'dwstgg',
            text: '#Chrome',
            section: '#chrome',
          },
          ' and ',
          {
            type: 'dwstgg',
            text: '#Firefox',
            section: '#firefox',
          },
          '.',
        ],
        '',
      ], 'system');
      return;
    }
    if (page === '#privacy') {
      const gaSection = [
        'We use ',
        {
          type: 'link',
          text: 'Google Analytics',
          url: 'https://www.google.com/analytics/',
        },
        ' to collect information about DWST usage. ',
        'The main motivation is to collect statistical information to aid us develop and promote the software. ',
      ];
      const disableTracking = [
        'There are several ways to disable tracking. ',
        'You could use some browser extension that blocks Google Analytics or',
        'you could use the DWST ',
        {
          type: 'dwstgg',
          text: '#development',
          section: '#development',
        },
        ' server which should have Google Analytics disabled.',
      ];
      const storageSection = [
        'Google Analytics stores some information in cookies. ',
        'DWST itself uses local storage for storing command history. ',
        'You may use the built-in ',
        {
          type: 'dwstgg',
          text: 'forget',
          section: 'forget',
        },
        ' command to quickly remove stored command history. ',
        'Consider using tools provided by your browser for more serious cleaning.',
      ];
      const futureChanges = [
        'This describes how we do things today. ',
        'Check this page again sometime for possible updates on privacy and tracking considerations.',
      ];
      mlog(([
        this._createBreadCrumbs(page),
        '',
        {
          type: 'h1',
          text: 'Privacy and Tracking Information',
        },
        '',
        gaSection,
        '',
        disableTracking,
        '',
        storageSection,
        '',
        futureChanges,
        '',
      ]), 'system');
      return;
    }

    log(`Unkown help page: ${page}`, 'error');
  }

  _commandHelp(command) {
    const plugin = commands.get(command);
    if (typeof plugin === 'undefined') {
      log(`the command does not exist: ${command}`, 'error');
      return;
    }
    if (typeof plugin.usage === 'undefined') {
      log(`no help available for: ${command}`, 'system');
      return;
    }
    const usage = plugin.usage().map(usageExample => {
      return {
        type: 'syntax',
        text: usageExample,
      };
    });
    const examples = plugin.examples().map(exampleCommand => {
      return {
        type: 'command',
        text: exampleCommand,
      };
    });

    mlog([
      this._createBreadCrumbs(command),
      '',
      [
        {
          type: 'h1',
          text: `${command}`,
        },
        {
          type: 'regular',
          text: ' &ndash; ',
          unsafe: true,
        },
        plugin.info(),
      ],
      '',
      '',
      {
        type: 'h2',
        text: 'Syntax',
      },
      '',
    ].concat(usage).concat([
      '',
      {
        type: 'h2',
        text: 'Examples',
      },
      '',
    ]).concat(examples).concat([
      '',
    ]), 'system');
  }

  run(parameter = null) {

    clearLog();

    if (parameter === null) {
      this._mainHelp();
      return;
    }
    const section = parameter.toLowerCase();
    if (section.charAt(0) === '#') {
      this._helpPage(section);
      return;
    }
    this._commandHelp(section);
  }
}

class Connect {

  commands() {
    return ['connect'];
  }

  usage() {
    return [
      '/connect <ws-url> [p1[,p2[,...]]]',
    ];
  }

  examples() {
    return [
      '/connect wss://echo.websocket.org/',
      '/connect ws://echo.websocket.org/',
      '/connect ws://127.0.0.1:1234/ protocol1.example.com,protocol2.example.com',
    ];
  }

  info() {
    return 'connect to a server';
  }

  run(url, protocolString = '') {
    if (connection !== null) {
      mlog([
        'Already connected to a server',
        [
          'Type ',
          {
            type: 'command',
            text: '/disconnect',
          },
          ' to end the conection',
        ],
      ], 'error');
      return;
    }
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
    if (self.origin.startsWith('https://') && url.startsWith('ws://')) {
      const secureUrl = `wss://${url.slice('ws://'.length)}`;
      mlog([
        [
          'Attempting unprotected connection from a secure origin. ',
          'See ',
          {
            type: 'dwstgg',
            text: '#unprotected',
            section: '#unprotected',
          },
          ' for details. Consider using ',
          {
            type: 'command',
            text: `/connect ${secureUrl} ${protocolString}`,
          },
        ],
      ], 'warning');
    }
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
    if (connection === null) {
      log('No connection to disconnect', 'warning');
    }
    const protocol = [];
    mlog([`Closing connection to ${connection.url}`].concat(protocol), 'system');
    connection.close();
  }
}

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
          const linkWrapperClasses = ['dwst-mlog__help-link-wrapper'];
          if (segment.wrap === false) {
            linkWrapperClasses.push('dwst-mlog__help-link-wrapper--nowrap');
          }
          linkWrapper.setAttribute('class', linkWrapperClasses.join(' '));
          const link = document.createElement('a');
          const classes = ['dwst-mlog__help-link'];
          if (segment.spacing === true) {
            classes.push('dwst-mlog__help-link--spacing');
          }
          if (segment.warning === true) {
            classes.push('dwst-mlog__help-link--warning');
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
          const byteGridClasses = ['dwst-bytegrid'];
          if (hexChunks.length < 3) {
            byteGridClasses.push('dwst-bytegrid--less-than-three');
          }
          byteGrid.setAttribute('class', byteGridClasses.join(' '));

          const chunksWanted = 4;
          const chunkLength = 4;
          [...Array(chunksWanted).keys()].forEach(i => {
            const [hexChunk = []] = [hexChunks[i]];
            const [textChunk = []] = [textChunks[i]];

            const hexContent = htmlescape(hexChunk.join(' '));
            const hexItem = document.createElement('div');
            hexItem.setAttribute('class', 'dwst-bytegrid__item');
            hexItem.innerHTML = hexContent;
            byteGrid.appendChild(hexItem);

            const textContent = htmlescape(textChunk.join('').padEnd(chunkLength));
            const textItem = document.createElement('div');
            textItem.setAttribute('class', 'dwst-bytegrid__item');
            textItem.innerHTML = textContent;
            byteGrid.appendChild(textItem);
          });

          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__hexline');
          textSpan.appendChild(byteGrid);
          return textSpan;
        }
        if (segment.type === 'code') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__code');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'strong') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__strong');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'h1') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__h1');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'h2') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__h2');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'syntax') {
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__syntax');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'link') {
          const textSpan = document.createElement('a');
          textSpan.setAttribute('href', segment.url);
          textSpan.setAttribute('target', '_blank');
          textSpan.setAttribute('rel', 'noopener');
          textSpan.setAttribute('class', 'dwst-mlog__link');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
      }
      throw new Error('unknown segment type');
    });
    return htmlSegments;
  });
  const time = currenttime();
  const logLine = document.createElement('div');
  logLine.setAttribute('class', `dwst-logline dwst-logline--${type}`);
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
  addLogLine(logLine);
}

function clearLog() {
  const logClear = document.createElement('div');
  logClear.setAttribute('class', 'dwst-logclear');
  addLogLine(logClear);
}

function addLogLine(logLine) {
  const terminal = document.getElementById('ter1');
  const userWasScrolling = isUserScrolling();
  terminal.appendChild(logLine);
  if (userWasScrolling) {
    return;
  }
  scrollLog();
}

function scrollLog() {
  const screen = document.getElementById('screen1');
  screen.scrollTop = screen.scrollHeight;
}

function isUserScrolling() {
  const screen = document.getElementById('screen1');
  return (screen.scrollTop !== (screen.scrollHeight - screen.offsetHeight));
}

function scrollNotificationUpdate() {
  if (isUserScrolling()) {
    showScrollNotification();
    return;
  }
  hideScrollNotification();
}

function showScrollNotification() {
  [...document.getElementsByClassName('js-scroll-notification')].forEach(sn => {
    sn.removeAttribute('style');
  });
}

function hideScrollNotification() {
  [...document.getElementsByClassName('js-scroll-notification')].forEach(sn => {
    sn.setAttribute('style', 'display: none;');
  });
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
  gfxContainer.setAttribute('aria-hidden', 'true');
  gfxContainer.appendChild(gfxContent);

  addLogLine(gfxContainer);

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

function flatList(values) {
  const segments = [];
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
  });
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
      const invisibleLeft = Math.round(invisible / 2);
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
  [...document.getElementsByClassName('js-auto-scroll-button')].forEach(asb => {
    asb.addEventListener('click', scrollLog);
  });
  setInterval(scrollNotificationUpdate, 100);
  document.getElementById('msg1').focus();

}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('load', updateGfxPositions);
