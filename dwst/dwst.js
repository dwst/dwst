
let ws = {};
let intervalId = null;
let VERSION = '1.3.4';
let bins = {};
let texts = {};
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
    let strs = ['Loaded texts:'];
    for (let i in texts) {
      let name = i;
      let text = texts[i];
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
      let buffer = bins[variable];
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
    let strs = ['Loaded binaries:'];
    for (let i in bins) {
      let name = i;
      let buffer = bins[i];
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
    let upload = document.getElementById('file1');
    upload.onchange = () => {
      let file = upload.files[0];
      let ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      let reader = new FileReader();
      reader.onload = (e2) => {
        let text = e2.target.result;
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
    let upload = document.getElementById('file1');
    upload.onchange = () => {
      let file = upload.files[0];
      let ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      let reader = new FileReader();
      reader.onload = (e2) => {
        let buffer = e2.target.result;
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
    let interval = parseNum(intervalStr);
    let spammer = () => {
      if (!isconnected()) {
        if (intervalId !== null) {
          log('interval failed, no connection', 'error');
          run('interval');
        }
        return;
      }
      if (commandParts.length < 1) {
        run('send', ['' + count]);
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
    let times = parseNum(timesStr);
    function spam(limit, i) {
      if (typeof(i) === typeof(undefiend)) {
        i = 0;
      }
      if (i === limit) {
        return;
      }
      if (commandParts.length < 1) {
        run('send', ['' + i]);
      } else {
        silent(commandParts.join(' '));
      }
      let nextspam = () => {
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
      let randomchar = () => {
        let out = Math.floor(Math.random()* (0xffff + 1));
        out /= 2; // avoid risky characters
        let char = String.fromCharCode(out);
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
      out = '' + Math.round(new Date().getTime() / 1000);
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
    let msg = processed.join('');
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
      let code = x.charCodeAt(0);
      if (code !== (code & 0xff)) {
        return 0;
      }
      return code;
    }
    function hexpairtobyte(hp) {
      let hex = hp.join('');
      if (hex.length !== 2) {
        return;
      }
      return parseInt(hex, 16);
    }
    let bytes = [];
    if (instr === 'default') {
      bytes = Array.prototype.map.call(params[0], byteValue);
    }
    if (instr === 'random') {
      let randombyte = () => {
        let out = Math.floor(Math.random()* (0xff + 1));
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
      let text = texts[variable];
      if (typeof(text) !== typeof(undefined)) {
        bytes = Array.prototype.map.call(text, byteValue);
      } else {
        bytes = [];
      }
    }
    if (instr === 'hex') {
      if (params.length === 1) {
        let hex = params[0];
        let nums = hex.split('');
        let pairs = divissimo(nums, 2);
        let tmp = Array.prototype.map.call(pairs, hexpairtobyte);
        bytes = tmp.filter(b => (typeof(b) === typeof(0)));
      } else {
        bytes = [];
      }
    }
    return new Uint8Array(bytes);
  }


  run(...buffers) {
    function joinbufs(buffers) {

      let total = 0;
      for (let i in buffers) {
        let buffer = buffers[i];
        total += buffer.length;
      }
      let out = new Uint8Array(total);
      let offset = 0;
      for (let i in buffers) {
        let buffer = buffers[i];
        out.set(buffer, offset);
        offset += buffer.length;
      }
      return out;
    }
    let out = joinbufs(buffers).buffer;
    let msg = `<${out.byteLength}B of data> `;
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
    let historyLine = historyManager.getSummary();
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
      let plugin = commands[command];
      if (typeof(plugin) === typeof(undefined)) {
        log(`the command does not exist: ${command}`, 'error');
        return;
      }
      if (typeof(plugin.usage) === typeof(undefined))
      {
        log(`no help available for: ${command}`, 'system');
        return;
      }
      const bread_crumbs = [
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
      const help = [bread_crumbs, '', title, ''].concat(usage).concat(['']).concat(examples).concat(['']);
      mlog(help, 'system');
      return;
    }
    let available = [];
    for (let c in commands) {
      if (c.length > 1) {
        let plugin = commands[c];
        let ndash = {
          type: 'regular',
          text: '&ndash;',
          unsafe: true,
        };
        let info = '  ';
        if (typeof(plugin.info) !== typeof(undefined)) {
          info += plugin.info();
        }
        let cpad = Array(15 - c.length).join(' ');
        let commandSegment = {
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
    }
    else {
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
      }
      else {
        let fr = new FileReader();
        fr.onload = (e) => {
          let buffer = e.target.result;
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

  run()
  {
    discogui();
    ws.close();
    document.getElementById('url1').focus();
  }
}

let plugins = [Connect, Disconnect, Status, Forget, Help, Send, Spam, Interval, Binary, Loadbin, Bins, Clear, Loadtext, Texts];
let commands = {};

for (let i in plugins) {
  let constructor = plugins[i];
  let plugin = new constructor();
  let c = plugin.commands();
  for (let j in c) {
    let command = c[j];
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
  let pro = plugin.process;
  if (param.substr(param.length - 2, 2) === '\\\\') {
    param = param.substr(0, param.length - 2) + '\\';
  } else if (param.substr(param.length - 1, 1) === '\\') {
    param = param.substr(0, param.length - 1) + ' ';
  }
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
    let tmp = param.split(']');
    let call = tmp[0].split('[')[1];
    end = tmp[1];
    let tmp2 = call.split('(').concat('');
    instruction = tmp2[0];
    let pl = tmp2[1].split(')')[0];
    if(pl.length > 0) {
      params = pl.split(',');
    }
  } else {
    params.push(param);
  }
  return pro(instruction, params, end);
}

function run(command, params) {
  if (typeof(params) === typeof(undefined)){
    params = [];
  }
  let plugin = commands[command];
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
  let processor = (param) => process(plugin, param);
  let processed = Array.prototype.map.call(params, processor);
  plugin.run(...processed);
}


function refreshclock() {
  let time = currenttime();
  document.getElementById('clock1').innerHTML = time;
}

function currenttime() {
  let addzero = (i) => {
    if (i < 10) {
      return '0'+i;
    }
    return ''+i;
  };
  let date = new Date();
  let time = `${addzero(date.getHours())}:${addzero(date.getMinutes())}<span class="sec">:${addzero(date.getSeconds())}</span>`;
  return time;

}

function htmlescape(line) {
  return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseNum(str) {
  if (str.length > 2 && str.substr(0,2) === '0x') {
    return parseInt(str.substr(2), 16);
  }
  let num = parseInt(str, 10);
  return num;
}

function log(line, type) {
  mlog([line], type);
}

function mlog(lines, type) {
  let lineElements = Array.prototype.map.call(lines, rawLine => {
    let line;
    if (typeof rawLine === typeof '') {
      line = [rawLine];
    } else if (typeof rawLine === typeof {} && !Array.isArray(rawLine)) {
      line = [rawLine];
    } else {
      line = rawLine;
    }
    if (typeof line === typeof []) {
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
    }
  });
  let time = currenttime();
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
  let screen = document.getElementById('screen1');
  screen.scrollTop = screen.scrollHeight;
}

function divissimo(l, n) {
  let chunks = [];
  let chunk = [];
  let i = 0;
  for (let j in l) {
    let b = l[j];
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
    let hex = num.toString(16);
    let zero = hex.length < 2 ? '0' : '';
    return zero + hex;
  }
  function charify(num) {
    if (num > 0x7e || num < 0x20) { // non-printable
      return '.';
    }
    return String.fromCharCode(num);
  }
  let dv = new DataView(buffer);
  let offset = 0;
  let lines = [];
  while(offset < buffer.byteLength){
    let chars = '';
    let hexes = '';
    for (let i = 0; i < 16; i++) {
      if (offset < buffer.byteLength) {
        let byte = dv.getUint8(offset);
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
    lines.push(hexes + '  |' + chars + '|');

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
    } else {
      return [prefix, line];
    }
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
  let noslash = line.substring(1);
  let parts = noslash.split(' ');
  let command = parts.shift();
  let params = parts;
  run(command, params);
}

function loud(line) {
  log(line, 'command');
  silent(line);
}

function send() {
  let raw = document.getElementById('msg1').value;
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
  let replmap = [[' [','\\ \\['], [' ','\\ ']];

  function replacer(str, rm) {
    if (rm.length < 1) {
      return str;
    }
    let head = rm[0];
    let find = head[0];
    let rep = head[1];

    let parts = str.split(find);
    let complete = [];
    for (let i in parts) {
      let part = parts[i];
      let loput = rm.slice(1);
      let news = replacer(part, loput);
      complete.push(news);
    }
    let out = complete.join(rep);
    return(out);
  }
  let almost = replacer(raw, replmap);
  let final;
  if (almost[0] === '[') {
    final = '\\' + almost;
  } else {
    final = almost;
  }
  loud('/send ' + final);
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

let menu = new Menu();

function guidisconnect() {
  loud('/disconnect');

}

function guiconnect() {
  menu.hide();
  let url = document.getElementById('url1').value;
  let proto = document.getElementById('proto1').value;
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
    if (this.idx > 0)
      return this.history[--(this.idx)];
    if (this.idx === 0) {
      (this.idx)--;
      return '';
    }

    return '';
  }

  getPrevious() {
    if (this.history.length === 0)
      return '';
    if (this.idx + 1 < this.history.length)
      return this.history[++(this.idx)];
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
        (this.idx)++;
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
    let all = {};
    for (let key in this.histories) {
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
    let historyLineData = [];
    for (let key in histories) {
      if (histories.hasOwnProperty(key)) {
        const history = histories[key];
        const count = history.length;
        if (count > 0) {
          historyLineData.push([count, key]);
        }
      }
    }

    let historyLine = ['Persistent history '];
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
      delete this.histories[target];
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

    if (ele.value !== eHistory.getCurrent())
      this.addItem(ele.id, ele.value, true);

    return eHistory.getNext();
  }

  getPrevious(ele) {
    const eHistory = this.getCreate(ele.id);
    if (eHistory === null) {
      return null;
    }

    if (ele.value !== eHistory.getCurrent())
      this.addItem(ele.id, ele.value, true);

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
        return true;
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
    let box = document.activeElement;
    box.value = historyManager.getPrevious(box);
    return true;
  } else if (event.keyCode === 40) { // down
    let box = document.activeElement;
    box.value = historyManager.getNext(box);
    return true;
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

function parseParams() {
    let query = window.location.href.split('?')[1];
    let defs;
    if (query !== undefined) {
      defs = query.split('&');
    }
    let params = {};
    for (let i in defs) {
      let parts = defs[i].split('=');
      params[parts[0]] = parts[1];
    }
    return params;
}

function init() {
  let params = parseParams();
  let connected = params.connected;
  let socket = params.socket;
  let proto = params.proto;

  if (proto) {
      document.getElementById('proto1').value = proto;
  }
  if (socket) {
      document.getElementById('url1').value = socket;
  }
  refreshclock();
  document.getElementById('clock1').removeAttribute('style');
  setInterval( refreshclock, 500 );
  if (('WebSocket' in window) === false) {
    log('Your browser does not seem to support websockets.', 'error');
    return;
  }
  loud('/status');
  if(connected === 'true')
  {
    document.getElementById('conbut1').click();
  }
  else
  {
    menu.show();
  }

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
      let setOperation = {};
      setOperation[saveKey] = saveState;
      chrome.storage.local.set(setOperation);
    };

    const saveStates = Object.assign({
      history_commands: '[]',
      history_urls: '[]',
      history_protocols: '[]',
    }, response);
    let savedHistories = [];
    for (let key in saveStates) {
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


