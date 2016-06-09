
const VERSION = '1.3.4';
const bins = {};
const texts = {};
let ws = {};
let intervalId = null;
let historyManager;

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

  run(variable=null) {
    if (variable !== null) {
      const text = texts[variable];
      if (typeof(text) !== typeof(undefined)) {
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
    const strs = ['Loaded texts:'];
    for (const i in texts) {
      const name = i;
      const text = texts[i];
      strs.push(`"${name}": <${text.length}B of text data>`);
    }
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

  run(variable=null) {
    if (variable !== null) {
      const buffer = bins[variable];
      if (typeof(buffer) !== typeof(undefined)) {
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
    const strs = ['Loaded binaries:'];
    for (const i in bins) {
      const name = i;
      const buffer = bins[i];
      strs.push(`"${name}": <${buffer.byteLength}B of binary data>`);
    }
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
      reader.onload = (e2) => {
        const text = e2.target.result;
        texts[variable] = text;
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
      reader.onload = (e2) => {
        const buffer = e2.target.result;
        bins[variable] = buffer;
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

  run(intervalStr=null, ...commandParts) {
    if (intervalStr === null) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        log('interval cleared', 'system');
      } else {
        log('no interval to clear', 'error');
      }
      return;
    }
    let count = 0;
    const interval = parseNum(intervalStr);
    const spammer = () => {
      if (!isconnected()) {
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
    function spam(limit, i=0) {
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
      if (isconnected()) {
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
    return ['send','s',''];
  }

  usage() {
    return [
      '/send [components...]',
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
        let out = Math.floor(Math.random()* (0xffff + 1));
        out /= 2; // avoid risky characters
        const char = String.fromCharCode(out);
        return char;
      };
      let num = 16;
      if (params.length === 1){
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
      out = texts[variable];
    }
    if (instr === 'time') {
      out = String(Math.round(new Date().getTime() / 1000));
    }
    if (instr === 'range') {
      let start = 32;
      let end = 126;
      if (params.length === 1){
        end = parseNum(params[0]);
      }
      if (params.length === 2){
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
    if (typeof(ws.readyState) === typeof(undefined) || ws.readyState > 1) { //CLOSING or CLOSED
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
    ws.send(msg);
  }
}

class Binary {

  commands() {
    return ['binary','b'];
  }

  usage() {
    return [
      '/binary [components...]',
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
      '/binary [hex(52)] [random(1)]\ lol',
    ];
  }

  info() {
    return 'send binary data';
  }

  process(instr, params) {
    function byteValue(x) {
      const code = x.charCodeAt(0);
      if (code !== (code & 0xff)) {
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
        const out = Math.floor(Math.random()* (0xff + 1));
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
      if (params.length === 1){
        end = parseNum(params[0]);
      }
      if (params.length === 2){
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
      let buffer = bins[variable];
      if (typeof(buffer) === typeof(undefined)) {
        buffer = [];
      }
      return new Uint8Array(buffer);
    }
    if (instr === 'text') {
      let variable = 'default';
      if (params.length === 1) {
        variable = params[0];
      }
      const text = texts[variable];
      if (typeof(text) !== typeof(undefined)) {
        bytes = [...text].map(byteValue);
      } else {
        bytes = [];
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
    function joinbufs(buffers) {

      let total = 0;
      for (const i in buffers) {
        const buffer = buffers[i];
        total += buffer.length;
      }
      const out = new Uint8Array(total);
      let offset = 0;
      for (const i in buffers) {
        const buffer = buffers[i];
        out.set(buffer, offset);
        offset += buffer.length;
      }
      return out;
    }
    const out = joinbufs(buffers).buffer;
    const msg = `<${out.byteLength}B of data> `;
    if (typeof(ws.readyState) === typeof(undefined) || ws.readyState > 1) { //CLOSING or CLOSED
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
    ws.send(out);
  }
}

class Status {

  commands() {
    return ['status'];
  }

  usage() {
    return [
      '/status',
    ];
  }

  examples() {
    return [
      '/status',
    ];
  }

  info() {
    return 'find out current status';
  }

  run() {
    const historyLine = historyManager.getSummary();
    mlog([
      {
        type: 'strong',
        text: `Dark WebSocket Terminal ${VERSION}`,
      },
      '',
      'Type text into the box below to send messages to the web socket server.',
      [
        'Type ',
        {
          type: 'command',
          text: '/help',
        },
        ' for a list of available commands.',
      ],
      '',
      historyLine,
      [
        'Type ',
        {
          type: 'command',
          text: '/forget everything',
        },
        ' to throw them away.',
      ],
      '',
    ], 'system');
  }

}


class Forget {

  commands() {
    return ['forget'];
  }

  usage() {
    return [
      '/forget <target>',
    ];
  }

  examples() {
    return [
      '/forget commands',
      '/forget urls',
      '/forget protocols',
      '/forget everything',
    ];
  }

  info() {
    return 'remove things from history';
  }

  run(target) {
    if (target === 'everything') {
      historyManager.forget();
    } else if (target === 'commands' || target === 'urls' || target === 'protocols') {
      historyManager.forget(target);
    } else {
      const historyLine = historyManager.getSummary();
      mlog([`Invalid argument: ${target}`, historyLine], 'error');
      return;
    }
    const historyLine = historyManager.getSummary();
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
      const plugin = commands[command];
      if (typeof(plugin) === typeof(undefined)) {
        log(`the command does not exist: ${command}`, 'error');
        return;
      }
      if (typeof(plugin.usage) === typeof(undefined)) {
        log(`no help available for: ${command}`, 'system');
        return;
      }
      const breadCrumbs = [
        {
          type: 'dwstgg',
          text: `DWSTGG`,
        },
        {
          type: 'regular',
          text: ` &raquo; `,
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
      const usageItems = plugin.usage().map((usage) => {
        return {
          type: 'syntax',
          text: usage,
        };
      });
      const usage = formatList('Usage', usageItems);
      const examplesItems = plugin.examples().map((command) => {
        return {
          type: 'command',
          text: command,
        };
      });

      const examplesTitle = (examplesItems.length < 2) ? (
        'Example'
      ) : (
        'Examples'
      );
      const examples = formatList(examplesTitle, examplesItems);
      const help = [breadCrumbs, '', title, ''].concat(usage).concat(['']).concat(examples).concat(['']);
      mlog(help, 'system');
      return;
    }
    const available = [];
    for (const c in commands) {
      if (c.length > 1) {
        const plugin = commands[c];
        const ndash = {
          type: 'regular',
          text: '&ndash;',
          unsafe: true,
        };
        let info = '  ';
        if (typeof(plugin.info) !== typeof(undefined)) {
          info += plugin.info();
        }
        const cpad = Array(15 - c.length).join(' ');
        const commandSegment = {
          type: 'dwstgg',
          text: c,
          section: c,
        };
        available.push([commandSegment, cpad, ndash, info]);
      }
    }
    available.sort();

    const commandsList = formatList('Commands', available);

    mlog([
      {
        type: 'strong',
        text: `DWST Guide to Galaxy`,
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
      '/connect <ws-url> [protocol]',
    ];
  }

  examples() {
    return [
      '/connect ws://echo.websocket.org/',
    ];
  }

  info() {
    return 'connect to a server';
  }

  run(url, proto) {
    let protostring = '';
    congui();
    if(proto === '') {
      ws = new WebSocket(url);
    } else {
      ws = new WebSocket(url,proto);
      protostring = `(protocol: ${proto})`;
    }
    ws.onopen = () => {
      log(`Connection established to ${url} ${protostring}`, 'system');
    };
    ws.onclose = () => {
      log(`connection closed, ${url} ${protostring}`, 'system');
      if (document.getElementById('conbut1').value === 'disconnect') {
        discogui();
      }
    };
    ws.onmessage = (msg) => {
      if (typeof(msg.data) === typeof('')) {
        log(msg.data, 'received');
      } else {
        const fr = new FileReader();
        fr.onload = (e) => {
          const buffer = e.target.result;
          blog(buffer, 'received');
        };
        fr.readAsArrayBuffer(msg.data);
      }

    };
    ws.onerror = () => {
      log(`websocket error: ${url} ${protostring}`, 'system');
    };
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
    discogui();
    ws.close();
    document.getElementById('url1').focus();
  }
}

const plugins = [Connect, Disconnect, Status, Forget, Help, Send, Spam, Interval, Binary, Loadbin, Bins, Clear, Loadtext, Texts];
const commands = {};

for (const i in plugins) {
  const constructor = plugins[i];
  const plugin = new constructor();
  const c = plugin.commands();
  for (const j in c) {
    const command = c[j];
    commands[command] = plugin;
  }
}

function congui() {
  document.getElementById('conbut1').value = 'disconnect';
  document.getElementById('url1').setAttribute('disabled', 'disabled');
  document.getElementById('proto1').setAttribute('disabled', 'disabled');
}

function discogui() {
  document.getElementById('conbut1').value = 'connect';
  document.getElementById('url1').removeAttribute('disabled');
  document.getElementById('proto1').removeAttribute('disabled');
}

function guiconbut() {
  if (document.getElementById('conbut1').value === 'connect') {
    guiconnect();
  } else {
    guidisconnect();
  }
}

function process(plugin, param) {
  const pro = plugin.process;
  /* eslint-disable prefer-template */
  if (param.substr(param.length - 2, 2) === '\\\\') {
    param = param.substr(0, param.length - 2) + '\\';
  } else if (param.substr(param.length - 1, 1) === '\\') {
    param = param.substr(0, param.length - 1) + ' ';
  }
  /* eslint-enable prefer-template */
  if (typeof(pro) === typeof(undefined)) {
    return param;
  }
  let instruction = 'default';
  let params = [];
  let end = '';
  if (param.substr(0,2) === '\\\\') {
    params.push(param.substr(1));
  } else if (param.substr(0,2) === '\\[') {
    params.push(param.substr(1));
  } else if (param.substr(0,1) === '[') {
    const tmp = param.split(']');
    const call = tmp[0].split('[')[1];
    end = tmp[1];
    const tmp2 = call.split('(').concat('');
    instruction = tmp2[0];
    const pl = tmp2[1].split(')')[0];
    if(pl.length > 0) {
      params = pl.split(',');
    }
  } else {
    params.push(param);
  }
  return pro(instruction, params, end);
}

function run(command, ...params) {

  const plugin = commands[command];
  if (typeof(plugin) === typeof(undefined)) {
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
  const addzero = (i) => {
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
  if (str.length > 2 && str.substr(0,2) === '0x') {
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
    if (typeof rawLine === typeof '') {
      line = [rawLine];
    } else if (typeof rawLine === typeof {} && !Array.isArray(rawLine)) {
      line = [rawLine];
    } else {
      line = rawLine;
    }
    if (typeof line !== typeof []) {
      throw 'error';
    }
    const htmlSegments = line.map(rawSegment => {
      let segment;
      if (typeof rawSegment === typeof '') {
        segment = {
          type: 'regular',
          text: rawSegment,
        };
      } else {
        segment = rawSegment;
      }
      if (typeof segment === typeof {}) {
        const rawText = segment.text;
        const safeText = ((segment.hasOwnProperty('unsafe') && segment.unsafe === true)) ? (
          rawText
        ) : (
          htmlescape(rawText)
        );

        if (segment.type === 'regular') {
          const textSpan = document.createElement('span');
          textSpan.innerHTML = safeText;
          return textSpan;
        }
        if (segment.type === 'dwstgg') {
          const link = document.createElement('a');
          link.setAttribute('class', 'dwst-mlog__help-link');
          const command = segment.hasOwnProperty('section') ? (
            `/help ${segment.section}`
          ) : (
            '/help'
          );
          link.onclick = () => {
            loud(command);
          };
          link.setAttribute('href', '#');
          link.setAttribute('title', command);
          const textSpan = document.createElement('span');
          textSpan.innerHTML = safeText;
          link.appendChild(textSpan);
          return link;
        }
        if (segment.type === 'command') {
          const link = document.createElement('a');
          link.setAttribute('class', 'dwst-mlog__command-link');
          const command = rawText;
          link.onclick = () => {
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
          const textSpan = document.createElement('span');
          textSpan.setAttribute('class', 'dwst-mlog__hexline');
          textSpan.innerHTML = safeText;
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
      throw 'unknown segment type';
    });
    return htmlSegments;
  });
  const time = currenttime();
  const terminal1 = document.getElementById('ter1');
  const logLine = document.createElement('tr');
  logLine.setAttribute('class', 'logline');
  logLine.innerHTML = `<td class="time">${time}</td><td class="direction ${type}">${type}:</td></tr>`;
  const outputCell = document.createElement('td');
  outputCell.setAttribute('class', 'preserved');
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

function divissimo(l, n) {
  const chunks = [];
  let chunk = [];
  let i = 0;
  for (const j in l) {
    const b = l[j];
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
    const zero = hex.length < 2 ? '0' : '';
    return zero + hex;
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
  while(offset < buffer.byteLength){
    let chars = '';
    let hexes = '';
    for (let i = 0; i < 16; i++) {
      if (offset < buffer.byteLength) {
        const byte = dv.getUint8(offset);
        chars += charify(byte);
        hexes += hexify(byte);
      } else {
        chars += ' ';
        hexes += '  ';
      }
      hexes += ' ';
      if (i === 7) {
        hexes += ' ';
      }
      offset += 1;
    }
    const line = `${hexes}  |${chars}|`
    lines.push(line);

  }
  return lines;
}

function formatList(listTitle, lines) {
  const titlePrefix = `${listTitle}: `;
  const spacePrefix = new Array(titlePrefix.length + 1).join(' ');
  return lines.map((line, i) => {
    const prefix = (i === 0) ? (
      titlePrefix
    ) : (
      spacePrefix
    );
    if (Array.isArray(line)) {
      return [prefix].concat(line);
    }
    return [prefix, line];
  });
}

function blog(buffer, type) {
  const msg = `<${buffer.byteLength}B of binary data>`;
  const hd = hexdump(buffer);
  const hexLines = hd.map(line => {
    return {
      type: 'hexline',
      text: line,
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
    return ;
  }
  const replmap = [[' [','\\ \\['], [' ','\\ ']];

  function replacer(str, rm) {
    if (rm.length < 1) {
      return str;
    }
    const head = rm[0];
    const find = head[0];
    const rep = head[1];

    const parts = str.split(find);
    const complete = [];
    for (const i in parts) {
      const part = parts[i];
      const loput = rm.slice(1);
      const news = replacer(part, loput);
      complete.push(news);
    }
    const out = complete.join(rep);
    return(out);
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
  return ;
}


class Menu {

  isopen() {
    return (document.getElementById('dim1').getAttribute('style') === null);
  }


  hide() {
    document.getElementById('dim1').setAttribute('style', 'visibility: hidden;');
    document.getElementById('msg1').focus();
    document.getElementById('sendbut1').removeAttribute('disabled');
    document.getElementById('menubut1').removeAttribute('class');
  }


  show() {
    document.getElementById('dim1').removeAttribute('style');
    document.getElementById('url1').focus();
    document.getElementById('sendbut1').setAttribute('disabled', 'disabled');
    document.getElementById('menubut1').setAttribute('class', 'active');
  }


  toggle() {
    if (this.isopen()) {
      menu.hide();
    } else {
      menu.show();
    }
  }
}

const menu = new Menu();

function guidisconnect() {
  loud('/disconnect');

}

function guiconnect() {
  menu.hide();
  const url = document.getElementById('url1').value;
  const proto = document.getElementById('proto1').value;
  loud(`/connect ${url} ${proto}`);
}

class ElementHistory {

  constructor(history = []) {
    if (!Array.isArray(history)) {
      throw 'invalid history saveState';
    }
    this.idx = -1;
    this.history = history;
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

}

class HistoryManager {

  constructor(savedHistories, options) {
    this.saveIds = {
      'msg1': 'commands',
      'url1': 'urls',
    };
    if (typeof options === typeof {} && options.hasOwnProperty('save')) {
      this.save = options.save;
    } else {
      this.save = () => {};
    }
    this.histories = {};
    savedHistories.forEach((historyObject) => {
      const [historyId, history] = historyObject;
      this.histories[historyId] = new ElementHistory(history);
    });
  }

  getHistoryId(eleId) {
    const mapping = {
      'url1': 'urls',
      'msg1': 'commands',
      'proto1': 'protocols',
    };
    if (!mapping.hasOwnProperty(eleId)) {
      return null;
    }
    return mapping[eleId];
  }

  getAll() {
    const all = {};
    for (const key in this.histories) {
      if (this.histories.hasOwnProperty(key)) {
        const eHistory = this.histories[key];
        const history = eHistory.getAll();
        all[key] = history;
      }
    }
    return all;
  }

  getSummary() {
    const histories = this.getAll();
    const historyLineData = [];
    for (const key in histories) {
      if (histories.hasOwnProperty(key)) {
        const history = histories[key];
        const count = history.length;
        if (count > 0) {
          historyLineData.push([count, key]);
        }
      }
    }

    const historyLine = ['Persistent history '];
    if (Object.keys(historyLineData).length < 1) {
      historyLine.push('is empty');
    } else {
      historyLine.push('contains ');
      historyLineData.sort((a, b) => {
        return a[0] < b[0];
      });
      let remaining = Object.keys(historyLineData).length;
      historyLineData.forEach(item => {
        const [count, key] = item;
        historyLine.push({
          type: 'strong',
          text: `${count}`,
        });
        const units = {
          urls: 'urls',
          commands: 'commands',
          protocols: 'protocol definitions',
        };
        const unit = (count > 1) ? (
          units[key]
        ) : (
          units[key].slice(0, -1) // remove plural s
        );
        historyLine.push(' ');
        historyLine.push(unit);
        remaining -= 1;
        if (remaining > 1) {
          historyLine.push(', ');
        } else if (remaining === 1) {
          historyLine.push(' and ');
        }
      });
    }
    historyLine.push('.');
    return historyLine;
  }

  forget(historyId = null) {
    let targets;
    if (historyId === null) {
      targets = Object.keys(this.histories);
    } else {
      if (!this.histories.hasOwnProperty(historyId)) {
        return false;
      }
      targets = [historyId];
    }
    targets.forEach(target => {
      Reflect.deleteProperty(this.histories, target)
      this.save(target, []);
    });
    return true;
  }

  getCreate(eleId) {
    const historyId = this.getHistoryId(eleId);
    if (historyId === null) {
      return null;
    }
    if (! this.histories.hasOwnProperty(historyId)) {
      this.histories[historyId] = new ElementHistory();
    }
    return this.histories[historyId];
  }

  addItem(eleId, value, edition) {
    const eHistory = this.getCreate(eleId);
    if (eHistory === null) {
      return;
    }
    const historyId = this.getHistoryId(eleId);
    eHistory.addItem(value, edition, () => {
      const history = eHistory.getAll();
      this.save(historyId, history);
    });
  }

  getNext(ele) {
    const eHistory = this.getCreate(ele.id);
    if (eHistory === null) {
      return null;
    }

    if (ele.value !== eHistory.getCurrent()) {
      this.addItem(ele.id, ele.value, true);
    }

    return eHistory.getNext();
  }

  getPrevious(ele) {
    const eHistory = this.getCreate(ele.id);
    if (eHistory === null) {
      return null;
    }

    if (ele.value !== eHistory.getCurrent()) {
      this.addItem(ele.id, ele.value, true);
    }

    return eHistory.getPrevious();
  }

  select(ele) {
    const eHistory = this.getCreate(ele.id);
    if (eHistory === null) {
      return;
    }

    this.addItem(ele.id, ele.value);
    eHistory.gotoBottom();
  }

  atBottom(ele) {
    const eHistory = this.getCreate(ele.id);
    if (eHistory === null) {
      return null;
    }

    return eHistory.idx === -1;
  }
}

function keypress() {
  if (event.keyCode === 13) {
    if (menu.isopen()) {
      if (isconnected()) {
        return;
      }
      historyManager.select(document.activeElement);
      document.getElementById('conbut1').click();
    } else {
      historyManager.select(document.activeElement);
      document.getElementById('sendbut1').click();
    }
  } else if (event.keyIdentifier === 'U+001B') {
    if (typeof(ws.readyState) === typeof(undefined)) {
      menu.toggle();
    } else if (ws.readyState < 2) { // OPEN or CONNECTING
      guidisconnect();
    } else {
      menu.toggle();
    }
  } else if (event.keyCode === 38) { // up
    const box = document.activeElement;
    box.value = historyManager.getPrevious(box);
    return;
  } else if (event.keyCode === 40) { // down
    const box = document.activeElement;
    box.value = historyManager.getNext(box);
    return;
  }
}

function isconnected() {
  if (typeof(ws.readyState) === typeof(undefined)) {
    return false;
  }
  if (ws.readyState === 1) {
    return true;
  }
  return false;
}

function init() {

  refreshclock();
  document.getElementById('clock1').removeAttribute('style');
  setInterval( refreshclock, 500 );
  loud('/status');

  menu.show();

  document.addEventListener('keydown', keypress);
  document.getElementById('sendbut1').addEventListener('click', send);
  document.getElementById('menubut1').addEventListener('click', () => menu.toggle());
  document.getElementById('open1').addEventListener('click', (e) => e.stopPropagation());
  document.getElementById('dim1').addEventListener('click', () => menu.hide());
  document.getElementById('conbut1').addEventListener('click', guiconbut);
}

function loadSaves(callBack) {
  chrome.storage.local.get(['history_commands', 'history_urls', 'history_protocols'], response => {
    const save = (historyId, history) => {
      const saveKey = `history_${historyId}`;
      const saveState = JSON.stringify(history);
      const setOperation = {};
      setOperation[saveKey] = saveState;
      chrome.storage.local.set(setOperation);
    };

    const saveStates = Object.assign({
      history_commands: '[]',
      history_urls: '[]',
      history_protocols: '[]',
    }, response);
    const savedHistories = [];
    for (const key in saveStates) {
      if (saveStates.hasOwnProperty(key)) {
        const saveState = saveStates[key];
        const history = JSON.parse(saveState);
        const parts = key.split('_');
        const historyId = parts[1];
        savedHistories.push([historyId, history]);
      }
    }
    historyManager = new HistoryManager(savedHistories, { save: save });
    callBack();
  });
}

document.addEventListener('DOMContentLoaded', loadSaves(init));


