
var ws = {};
var intervalId = null;
var VERSION = '1.3.4';
var bins = {};
var texts = {};

function Clear() {}
Clear.prototype.commands = function() {
  return ['clear'];
}
Clear.prototype.help = function() {
  return ['usage: /clear'];
}
Clear.prototype.info = function() {
  return 'clear the screen'
}
Clear.prototype.run = function(params) {
  document.getElementById('ter1').innerHTML = '';
}

function Texts() {}
Texts.prototype.commands = function() {
  return ['texts'];
}
Texts.prototype.help = function() {
  return ['usage: /texts [name]',
    'examples:',
    '/texts',
    '/texts default'
  ];
}
Texts.prototype.info = function() {
  return 'list loaded texts'
}
Texts.prototype.run = function(params) {
  if (params.length == 1) {
    variable = params[0];
    text = texts[variable];
    if (typeof(text) != typeof(undefined)) {
      log(text, 'system');
      return;
    }
    log('text "' + variable + '" does not exist', 'error');
  }
  var strs = ['Loaded texts:'];
  for (var i in texts) {
    var name = i;
    var text = texts[i];
    strs.push('"' + name + '": <' + text.length + 'B of text data>');
  }
  mlog(strs, 'system');
}

function Bins() {}
Bins.prototype.commands = function() {
  return ['bins'];
}
Bins.prototype.help = function() {
  return ['usage: /bins [name]',
    'examples:',
    '/bins',
    '/bins default'
  ];
}
Bins.prototype.info = function() {
  return 'list loaded binaries'
}
Bins.prototype.run = function(params) {
  if (params.length == 1) {
    variable = params[0];
    buffer = bins[variable];
    if (typeof(buffer) != typeof(undefined)) {
      blog(buffer, 'system');
      return;
    }
    log('binary "' + variable + '" does not exist', 'error');
  }
  var strs = ['Loaded binaries:'];
  for (var i in bins) {
    var name = i;
    var buffer = bins[i];
    strs.push('"' + name + '": <' + buffer.byteLength + 'B of binary data>');
  }
  mlog(strs, 'system');
}

function Loadtext() {}
Loadtext.prototype.commands = function() {
  return ['loadtext'];
}
Loadtext.prototype.help = function() {
  return ['usage: /loadtext [variable] [encoding]',
    'examples:',
    '/loadtext',
    '/loadtext default',
    '/loadtext default utf-8'
  ];
}
Loadtext.prototype.info = function() {
  return 'load text data from a file'
}
Loadtext.prototype.run = function(params) {
      var variable = 'default';
      var encoding;
      if (params.length > 0) {
        variable = params[0];
      }
      if (params.length > 1) {
        encoding = params[1];
      }
      var upload = document.getElementById('file1');
      upload.onchange = function(e) {
        var file = upload.files[0];
        var ff = document.getElementById('fileframe');
        ff.innerHTML = ff.innerHTML;
        reader = new FileReader();
        reader.onload = function(e2) {
          var text = e2.target.result;
          texts[variable] = text;
          log('Text file ' + file.fileName + ' (' + text.length + 'B)' + ' loaded to "' + variable + '"', 'system');
        };
        reader.readAsText(file, encoding);
      }
      upload.click();
}

function Loadbin() {}
Loadbin.prototype.commands = function() {
  return ['loadbin'];
}
Loadbin.prototype.help = function() {
  return ['usage: /loadbin [variable]',
    'examples:',
    '/loadbin',
    '/loadbin default'
  ];
}
Loadbin.prototype.info = function() {
  return 'load binary data from a file'
}
Loadbin.prototype.run = function(params) {
      var variable = 'default';
      if (params.length == 1) {
        variable = params[0];
      }
      var upload = document.getElementById('file1');
      upload.onchange = function(e) {
        var file = upload.files[0];
        var ff = document.getElementById('fileframe');
        ff.innerHTML = ff.innerHTML;
        reader = new FileReader();
        reader.onload = function(e2) {
          var buffer = e2.target.result;
          bins[variable] = buffer;
          log('Binary file ' + file.fileName + ' (' + buffer.byteLength + 'B)' + ' loaded to "' + variable + '"', 'system');
        };
        reader.readAsArrayBuffer(file);
      }
      upload.click();
}

function Interval() {}
Interval.prototype.commands = function() {
  return ['interval'];
}
Interval.prototype.help = function() {
  return ['usage: /interval <interval> [command line...]','       /interval',
    'examples:',
    '/interval 1000',
    '/interval 1000 /binary [random(10)]',
    '/interval'
  ];
}
Interval.prototype.info = function() {
  return 'run a command periodically'
}
Interval.prototype.run = function(params) {
  if (params.length < 1) {
    if (intervalId != null) {
      clearInterval(intervalId);
      log('interval cleared', 'system');
    } else {
      log('no interval to clear', 'error');
    }
    return;
  }
  var count = 0;
  var first = params.shift();
  var interval = parseNum(first);
  var spammer = function() {
    if (!isconnected()) {
      if (intervalId != null) {
        log('interval failed, no connection', 'error');
        run('interval');
      }
      return;
    }
    if (params.length < 1) {
      run('send', ['' + count]);
      count += 1;
      return;
    }
    silent(params.join(' '));
  }
  if (intervalId != null) {
    log('clearing old interval', 'system');
    clearInterval(intervalId);
  }
  intervalId = setInterval(spammer, interval);
  log('interval set', 'system');
}

function Spam() {}
Spam.prototype.commands = function() {
  return ['spam'];
}
Spam.prototype.help = function() {
  return ['usage: /spam <times> [command line...]',
    'examples:',
    '/spam 10',
    '/spam 6 /binary [random(10)]'
  ];
}
Spam.prototype.info = function() {
  return 'run a command multiple times in a row'
}
Spam.prototype.run = function(params) {
  var times = parseNum(params.shift());
  function spam(limit, i) {
    if (typeof(i) == typeof(undefiend)) {
      i = 0;
    }
    if (i == limit) {
      return;
    }
    if (params.length < 1) {
      run('send', ['' + i]);
    } else {    
      silent(params.join(' '));
    }
    var nextspam = function() {
      spam(limit, i + 1);
    }
    if (isconnected()) {
      setTimeout(nextspam, 0)
    } else {
        log('spam failed, no connection', 'error');
    }
  }
  spam(times);
}

function Send() {}
Send.prototype.commands = function() {
  return ['send','s',''];
}
Send.prototype.help = function() {
  return ['usage: /send [components...]',
    'examples:',
    '/send Hello\\ world!',
    '/send rpc( [random(5)] )',
    '/send [text]',
    '/send \\["JSON","is","cool"]',
    '/send [time] s\\ since\\ epoch',
    '/send From\\ a\\ to\\ z:\\ [range(97,122)]'
  ];
}
Send.prototype.info = function() {
  return 'send textual data'
}
Send.prototype.process = function(instr, params, postfix) {
  var out;
  if (instr == 'default') {
    out = params[0];
  }
  if (instr == 'random') {
    function randomchar() {
      var out = Math.floor(Math.random()* (0xffff + 1));
      out /= 2; // avoid risky characters
      var char = String.fromCharCode(out);
      return char;
    }
    var num = 16;
    if (params.length == 1){
      num = parseNum(params[0]);
    }
    var str = '';
    for (var i = 0; i < num; i++) {
      str += randomchar();
    }
    out = str;      
  }
  if (instr == 'text') {
    var variable = 'default';
    if (params.length == 1) {
      variable = params[0];
    }
    out = texts[variable];
  }
  if (instr == 'time') {
    out = '' + Math.round(new Date().getTime() / 1000);
  }
  if (instr == 'range') {
    var start = 32;
    var end = 126;
    if (params.length == 1){
      end = parseNum(params[0]);
    }
    if (params.length == 2){
      start = parseNum(params[0]);
      end = parseNum(params[1]);
    }
    var str = '';
    for (var i = start; i <= end; i++) {
      str += String.fromCharCode(i);
    }
    out = str;      
  }
  return out + postfix;
}
Send.prototype.run = function(processed) {
  var msg = processed.join('');
  if (typeof(ws.readyState) == typeof(undefined) || ws.readyState > 1) { //CLOSING or CLOSED
    mlog(['no connection', 'cannot send: ' + msg, 'connect first with /connect'], 'error');
    return;
  }
  log(msg, "sent");
  ws.send(msg);
}

function Binary() {}
Binary.prototype.commands = function() {
  return ['binary','b'];
}
Binary.prototype.help = function() {
  return ['usage: /binary [components...]',
    'examples:',
    '/binary Hello\\ world!',
    '/binary [random(16)]',
    '/binary [text]',
    '/binary [bin]',
    '/binary \\["JSON","is","cool"]',
    '/binary [range(0,0xff)]',
    '/binary [hex(1234567890abcdef)]',
    '/binary [hex(52)] [random(1)]\ lol'
  ];
}
Binary.prototype.info = function() {
  return 'send binary data'
}
Binary.prototype.process = function(instr, params) {
  function byteValue(x) {
    var code = x.charCodeAt(0);
    if (code != (code & 0xff)) {
      return 0;
    }
    return code;
  }
  function hexpairtobyte(hp) {
    hex = hp.join('');
    if (hex.length != 2) {
      return;
    }
    return parseInt(hex, 16);
  }
  var bytes = [];
  if (instr == 'default') {
    bytes = Array.prototype.map.call(params[0], byteValue);
  }
  if (instr == 'random') {
    function randombyte() {
      var out = Math.floor(Math.random()* (0xff + 1));
      return out;
    }
    var num = 16;
    if (params.length == 1) {
     num = parseNum(params[0]);
    }
    var bytes = [];
    for (var i = 0; i < num; i++) {
      bytes.push(randombyte());
    }
  }
  if (instr == 'range') {
    var start = 0;
    var end = 0xff;
    if (params.length == 1){
      end = parseNum(params[0]);
    }
    if (params.length == 2){
      start = parseNum(params[0]);
      end = parseNum(params[1]);
    }
    var bytes = [];
    for (var i = start; i <= end; i++) {
      bytes.push(i);
    }
  }
  if (instr == 'bin') {
    var variable = 'default';
    if (params.length == 1) {
      variable = params[0];
    }
    var buffer = bins[variable];
    if (typeof(buffer) == typeof(undefined)) {
      buffer = [];
    }
    return new Uint8Array(buffer);
  }
  if (instr == 'text') {
    var variable = 'default';
    if (params.length == 1) {
      variable = params[0];
    }
    text = texts[variable];
    if (typeof(text) != typeof(undefined)) {
      bytes = Array.prototype.map.call(text, byteValue);
    } else {
      bytes = [];
    }
  }
  if (instr == 'hex') {
    if (params.length == 1) {
      var hex = params[0];
      var nums = hex.split('');
      var pairs = divissimo(nums, 2);
      tmp = Array.prototype.map.call(pairs, hexpairtobyte);
      bytes = tmp.filter(function(b){return typeof(b) == typeof(0);})
    } else {
      bytes = [];
    }
  }
  return new Uint8Array(bytes);
}

Binary.prototype.run = function(buffers) {
  function joinbufs(buffers) {

    var total = 0;
    for (var i in buffers) {
      buffer = buffers[i];
      total += buffer.length;
    }
    var out = new Uint8Array(total);
    var offset = 0;
    for (var i in buffers) {
      buffer = buffers[i];
      out.set(buffer, offset);
      offset += buffer.length;
    }
    return out;
  }
  var out = joinbufs(buffers).buffer;
  var msg = '<' + out.byteLength + 'B of data> ';
  if (typeof(ws.readyState) == typeof(undefined) || ws.readyState > 1) { //CLOSING or CLOSED
    mlog(['no connection', 'cannot send: ' + msg, 'connect first with /connect'], 'error');
    return;
  }
  blog(out, "sent");
  ws.send(out);
}

function Help() {}
Help.prototype.commands = function() {
  return ['help'];
}
Help.prototype.info = function() {
  return 'get help'
}
Help.prototype.run = function(params) {
  for (var i in params) {
    var command = params[i];
    var plugin = commands[command];
    if (typeof(plugin) == typeof(undefined)) {
      log('the command does not exist: ' + command, 'error');
      return;
    }
    if (typeof(plugin.help) == typeof(undefined))
    {
      log('no help available for: ' + command, 'system');
      return;
    }
    mlog(plugin.help(), 'system');
    return;
  }
  var available = [];
  for (var c in commands) {
    if (c.length > 1) {
      var plugin = commands[c];
      var info = '- ';
      if (typeof(plugin.info) != typeof(undefined)) {
        info += plugin.info();
      }
      var cpad = Array(15 - c.length).join(" ")
      
      available.push(c + cpad + info);
    }
  }
  available.sort();
  mlog(['Dark WebSocket Terminal ' + VERSION, 'Available commands:'].concat(available).concat(['for help on a command use: /help <command>']), 'system');
}

function Connect() {}
Connect.prototype.commands = function() {
  return ['connect'];
}
Connect.prototype.help = function() {
  return ['Usage: /connect <ws-url> [protocol]',
    'examples:',
    '/connect ws://echo.websocket.org/'
  ];
}
Connect.prototype.info = function() {
  return 'connect to a server'
}
Connect.prototype.run = function(params) {
  var url = params[0];
  var proto = params[1];
  var protostring = ''
  congui();
  if(proto == '') {
    ws = new WebSocket(url);
  }
  else {
    ws = new WebSocket(url,proto);
    protostring = " (protocol: " + proto + ")"
  }
  ws.onopen = function() {
    log("connection established, " + url + protostring, "system");
  };
  ws.onclose = function() {
    log("connection closed, " + url + protostring, "system");
    if (document.getElementById('conbut1').value == "disconnect") {
      discogui();
    }
  };
  ws.onmessage = function(msg) {
    if (typeof(msg.data) == typeof('')) {
      log(msg.data, "received");
    }
    else {
      var fr = new FileReader();
      fr.onload = function(e) {
        var buffer = e.target.result;
        blog(buffer, "received");
      }
      fr.readAsArrayBuffer(msg.data);
    }

  };
  ws.onerror = function() {
    log('websocket error: ' + url + ' ' + protostring, "system");
  };
}

function Disconnect() {}
Disconnect.prototype.commands = function() {
  return ['disconnect'];
}
Disconnect.prototype.help = function() {
  return ["Disconnects from the server. (usage: /disconnect)"];
}
Disconnect.prototype.info = function() {
  return 'disconnect from a server'
}
Disconnect.prototype.run = function()
{
  discogui();
  ws.close();
  document.getElementById('url1').focus();
}

var plugins = [Connect, Disconnect, Help, Send, Spam, Interval, Binary, Loadbin, Bins, Clear, Loadtext, Texts];
var commands = {}

for (var i in plugins) {
  var constructor = plugins[i];
  var plugin = new constructor();
  var c = plugin.commands();
  for (var j in c) {
    var command = c[j];
    commands[command] = plugin;
  }
}

function congui() {
  document.getElementById('conbut1').value = "disconnect";
  document.getElementById('url1').setAttribute("disabled", "disabled");
  document.getElementById('proto1').setAttribute("disabled", "disabled");
}

function discogui() {
  document.getElementById('conbut1').value = "connect";
  document.getElementById('url1').removeAttribute("disabled");
  document.getElementById('proto1').removeAttribute("disabled");
}

function guiconbut() {
  if (document.getElementById('conbut1').value == "connect") {
    guiconnect();
  } else {
    guidisconnect();
  }
}

function process(plugin, param) {
  var pro = plugin.process;
  if (param.substr(param.length - 2, 2) == '\\\\') {
    param = param.substr(0, param.length - 2) + '\\';
  } else if (param.substr(param.length - 1, 1) == '\\') {
    param = param.substr(0, param.length - 1) + ' ';
  }
  if (typeof(pro) == typeof(undefined)) {
    return param;
  }
  var instruction = "default";
  var params = [];
  var end = '';
  if (param.substr(0,2) == '\\\\') {
    params.push(param.substr(1));
  } else if (param.substr(0,2) == '\\[') {
    params.push(param.substr(1));
  } else if (param.substr(0,1) == '[') {
    tmp = param.split(']')
    call = tmp[0].split('[')[1];
    end = tmp[1];
    tmp2 = call.split('(').concat('');
    instruction = tmp2[0];
    pl = tmp2[1].split(')')[0];
    if(pl.length > 0) {
      params = pl.split(',');
    }
  } else {
    params.push(param);
  }
  return pro(instruction, params, end);
}

function run(command, params) {
  if (typeof(params) == typeof(undefined)){
    params = [];
  }
  var plugin = commands[command];
  if (typeof(plugin) == typeof(undefined)) {
    log('invalid command: ' + command, 'error');
    return;
  }
  var processor = function(param){return process(plugin, param);}
  var processed = Array.prototype.map.call(params, processor);
  plugin.run(processed);
}


function refreshclock() {
  var time = currenttime();
  document.getElementById('clock1').innerHTML = time;
}

function currenttime() {
  addzero = function(i) {
    if (i < 10) {
      return "0"+i;
    }
    return ""+i;
  };
  var date = new Date();
  return time = addzero(date.getHours()) +":"+ addzero(date.getMinutes())+'<span class="sec">:'+ addzero(date.getSeconds())+'</span>';

}

function htmlescape(line) {
  return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseNum(str) {
  if (str.length > 2 && str.substr(0,2) == '0x') {
    return parseInt(str.substr(2), 16);
  }
  var num = parseInt(str, 10);
  return num;
}

function log(line, type) {
  mlog([line], type);
}

function mlog(lines, type, binary) {
  binclass = '';
  if (binary == true) {
    binclass = ' binary';
  }
  var escaped = Array.prototype.map.call(lines, htmlescape);
  var time = currenttime();
  document.getElementById('ter1').innerHTML += '<tr class="logline"><td class="time">'+time+'</td><td class="direction '+type+'">'+type+':</td><td class="preserved' + binclass + '">'+escaped.join('<br />')+'</td></tr>';
  var screen = document.getElementById("screen1");
  screen.scrollTop = screen.scrollHeight;
}

function divissimo(l, n) {
  var chunks = [];
  var chunk = [];
  var i = 0;
  for (var j in l) {
    b = l[j];
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
    var hex = num.toString(16);
    var zero = hex.length < 2 ? '0' : ''
    return zero + hex;
  }
  function charify(num) {
    if (num > 0x7e || num < 0x20) { // non-printable
      return '.';
    }
    return String.fromCharCode(num);
  }
  var dv = new DataView(buffer);
  var offset = 0;
  var lines = [];
  while(offset < buffer.byteLength){
    var chars = '';
    var hexes = '';
    for (var i = 0; i < 16; i++) {
      if (offset < buffer.byteLength) {
        byte = dv.getUint8(offset);
        chars += charify(byte);
        hexes += hexify(byte);
      } else {
        chars += ' ';
        hexes += '  '
      }
      hexes += ' ';
      if (i == 7) {
        hexes += ' ';
      } 
      offset += 1;
    }
    lines.push(hexes + '  |' + chars + '|');
  }
  return lines;
}

function blog(buffer, type) {
  msg = '<' + buffer.byteLength + 'B of binary data>';
  hd = hexdump(buffer);
  mlog([msg].concat(hd), type, true);
}

function silent(line) {
  var noslash = line.substring(1);
  var parts = noslash.split(' ');
  var command = parts.shift();
  var params = parts;
  run(command, params);
}

function loud(line) {
  log(line, 'command');
  silent(line);
}

function send() {
  var raw = document.getElementById('msg1').value;
  document.getElementById('msg1').value = "";
  if (raw.length < 1) {
    log('type /help to list available commands', 'system');
    return;
  }
  if (raw[0] == '/') {
    loud(raw);
    return ;
  }
  var replmap = [[' [','\\ \\['], [' ','\\ ']];

  function replacer(str, rm) {
    if (rm.length < 1) {
      return str;
    }
    var head = rm[0];
    var find = head[0];
    var rep = head[1];

    var parts = str.split(find);
    var complete = []
    for (var i in parts) {
      var part = parts[i];
      var loput = rm.slice(1)
      var news = replacer(part, loput);
      complete.push(news);
    }
    var out = complete.join(rep);
    return(out);
  }
  var almost = replacer(raw, replmap);
  var final;
  if (almost[0] == '[') {
    final = '\\' + almost;
  } else {
    final = almost; 
  }
  loud('/send ' + final);
  return ;
}


function Menu() {}
Menu.prototype.isopen = function() {
  return (document.getElementById('open').getAttribute("style") == null)
}

Menu.prototype.hide = function() {
  document.getElementById('open').setAttribute("style", "visibility: hidden;");
  document.getElementById('msg1').focus();
  document.getElementById('sendbut1').removeAttribute("disabled");
  document.getElementById('menubut1').removeAttribute("class");
}

Menu.prototype.show = function() {
  document.getElementById('open').removeAttribute("style");
  document.getElementById('url1').focus();
  document.getElementById('sendbut1').setAttribute("disabled", "disabled");
  document.getElementById('menubut1').setAttribute("class", "active");
}

Menu.prototype.toggle = function() {
  if (this.isopen()) {
    menu.hide();
  } else {
    menu.show();
  }
}
menu = new Menu();

function guidisconnect() {
  loud('/disconnect');

}

function guiconnect() {
  menu.hide();
  var url = document.getElementById('url1').value;
  var proto = document.getElementById('proto1').value;
  loud('/connect ' + url + ' ' + proto);
}

function ElementHistory() {
  this.idx = -1;
  this.history = [];
}
ElementHistory.prototype.getNext = function() {
  if (this.idx > 0)
    return this.history[--(this.idx)];
  if (this.idx == 0) {
    (this.idx)--;
    return "";
  }

  return "";
};
ElementHistory.prototype.getPrevious = function() {
  if (this.history.length == 0)
    return "";
  if (this.idx + 1 < this.history.length)
    return this.history[++(this.idx)];
  return this.history[this.history.length - 1];
};
ElementHistory.prototype.gotoBottom = function() {
  this.idx = -1;
};
ElementHistory.prototype.getLast = function() {
  return this.history[0]
}
ElementHistory.prototype.addItem = function(item, edition) {
  if (item != "" && item != this.getLast()) {
    this.history.unshift(item);
    if (edition) {
      (this.idx)++;
    }
  }
};
ElementHistory.prototype.removeBottom = function(item) {
  this.history.shift();
};
ElementHistory.prototype.getCurrent = function() {
  return this.history[this.idx];
};

function History() {}
History.prototype.addElement = function(ele) {
  this[ele.id] = new ElementHistory();
};
History.prototype.hasElement = function(ele) {
  return this.hasOwnProperty(ele.id);
};
History.prototype.getNext = function(ele) {
  if (! this.hasElement(ele))
    this.addElement(ele);

  if (ele.value != this[ele.id].getCurrent())
    this[ele.id].addItem(ele.value, true);
  
  return this[ele.id].getNext();
};
History.prototype.getPrevious = function(ele) {
  if (! this.hasElement(ele))
    this.addElement(ele);

  if (ele.value != this[ele.id].getCurrent())
    this[ele.id].addItem(ele.value, true);
  
  return this[ele.id].getPrevious();
};
History.prototype.select = function(ele) {
  if (! this.hasElement(ele))
    this.addElement(ele);

  this[ele.id].addItem(ele.value);
  this[ele.id].gotoBottom();
};
History.prototype.atBottom = function(ele) {
  return this[ele.id].idx == -1;
};

var hist = new History();

function keypress() {
  if (event.keyCode == 13) {
    if (menu.isopen()) {
      if (isconnected()) {
        return true;
      }
    hist.select(document.activeElement);
      document.getElementById('conbut1').click();
    } else {
    hist.select(document.activeElement);
      document.getElementById('sendbut1').click();
    }
  } else if (event.keyIdentifier == 'U+001B') {
    if (typeof(ws.readyState) == typeof(undefined)) {
      menu.toggle();
    } else if (ws.readyState < 2) { // OPEN or CONNECTING
      guidisconnect();
    } else {
      menu.toggle();
    }
  } else if (event.keyCode == 38) { // up
    box = document.activeElement;
    box.value = hist.getPrevious(box);
    return true;
  } else if (event.keyCode == 40) { // down
    box = document.activeElement;
    box.value = hist.getNext(box);
    return true;
  }
}

function isconnected() {
  if (typeof(ws.readyState) == typeof(undefined)) {
    return false;
  }
  if (ws.readyState == 1) {
    return true;
  }
  return false;
}

function parseParams() {
    var query = window.location.href.split('?')[1];
    if (query !== undefined) {
        var defs = query.split('&');
    }
    var params = {}
    for (var i in defs) {
        var parts = defs[i].split("=");
        params[parts[0]] = parts[1];
    }
    return params;
}

function init() {
  var params = parseParams();
  var connected = params.connected;
  var socket = params.socket;
  var proto = params.proto;

  if (proto) {
      document.getElementById('proto1').value = proto
  }
  if (socket) {
      document.getElementById('url1').value = socket
  }
  refreshclock();
  document.getElementById('clock1').removeAttribute("style");
  setInterval( refreshclock, 500 );
  if (("WebSocket" in window) == false) {
    log('Your browser does not seem to support websockets.', 'error');
    return;
  }
  loud('/help');
  if(connected == "true")
  {
    document.getElementById('conbut1').click()
  }
  else
  {
    menu.show();
  }

  document.addEventListener('keydown', keypress);
  document.getElementById('sendbut1').addEventListener('click', send);
  document.getElementById('menubut1').addEventListener('click', function(){menu.toggle()});
  document.getElementById('conbut1').addEventListener('click', guiconbut);
}

document.addEventListener('DOMContentLoaded', init);


