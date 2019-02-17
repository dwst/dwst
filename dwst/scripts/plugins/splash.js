
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

export default class Splash {

  constructor(dwst) {
    this._dwst = dwst;
  }

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

    const {m} = this._dwst.types;

    this._dwst.ui.terminal.clearLog();

    /* eslint-disable quotes,object-property-newline */

    /*
    This template is left here as a comment in hopes it helps with creating new splash shapes.
    The /idkfa command may also be of use when working with splash shapes.

    const shape = [
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
      ".       HH.      dd .        ..  TT    ..        ..        ..        ..    TT  ..        . dd      .HH       .",
    ];
    */

    const shape = [
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
    ];

    const defaultColors = [
      "f                                                                                                             ",
      "f                                                                                                             ",
      "f                                                                                                             ",
      "f                                                                                                             ",
      "f                                  fffff                                                                      ",
      "f                                    fff                                                                      ",
      "f                                     fff                                                                     ",
      "f                                      ff                                 ffff                                ",
      "f                                      ff                                 ff                                  ",
      "f                                  ffff ff  fff       ffff   ffffffff     f                                   ",
      "f                                fff  ffff fff         ffff ff      fff  ff                                   ",
      "f                                ff     fffff           fff fff       ffffffff                                ",
      "f                                ff     ffff             fff ffffffff  ff                                     ",
      "5                                555     555     555      55       555 55                                     ",
      "5                                 555   55555   55555   555 55     555 555                                    ",
      "5                                  5555555 5555555 5555555  555555555   5555                                  ",
      "5                                                                                                             ",
      "5                                                                                                             ",
      "5                                                                                                             ",
    ];

    const xmasColors = [
      "7                                                                                                             ",
      "7                                                                                                             ",
      "7                                                                                                             ",
      "7                                                                                                             ",
      "7                                  77777                                                                      ",
      "4                                    444                                                                      ",
      "4                                     447                                                                     ",
      "4                                      44                                 7777                                ",
      "4                                      44                                 44                                  ",
      "7                                  7774 44  777       7777   77777777     4                                   ",
      "7                                774  4444 444         4447 74      477  74                                   ",
      "4                                44     44444           444 444       47744444                                ",
      "4                                44     4444             447 44444444  44                                     ",
      "2                                222     222     222      22       222 22                                     ",
      "2                                 222   22222   22222   222 22     222 222                                    ",
      "2                                  2222222 2222222 2222222  222222222   2222                                  ",
      "2                                                                                                             ",
      "2                                                                                                             ",
      "2                                                                                                             ",
    ];

    /* eslint-enable quotes,object-property-newline */

    let colors = defaultColors;
    const now = new Date();
    const date = now.getDate();
    const month = now.getMonth();
    if (date === 24 && month === 11) {
      colors = xmasColors;
    }

    const CONNECTION_LIST_CAP = 3;
    const historySummary = this._dwst.model.history.getSummary();
    const maybeTooManyConnectCommands =  this._dwst.model.history.getConnectCommands(CONNECTION_LIST_CAP + 1);
    const connectCommands = maybeTooManyConnectCommands.slice(0, CONNECTION_LIST_CAP);
    const connectionsLines = connectCommands.map(command => m.line`${m.command(command)}`);
    const tooManyWarning = (() => {
      if (maybeTooManyConnectCommands.length > CONNECTION_LIST_CAP) {
        return [
          `(more than ${CONNECTION_LIST_CAP} in total, hiding some)`,
        ];
      }
      return [];
    })();
    const historySection = ([
      historySummary.concat(m.line`, including ${m.help('connect')} commands`),
    ]).concat(
      connectionsLines,
    ).concat(
      tooManyWarning,
    );
    const statusSection = (() => {
      const socket = this._dwst.model.connection.getSocket();
      if (socket === null) {
        return [];
      }
      const connectionStatus = m.line`Currently ${socket.verb} to ${m.strong(socket.url)}`;
      const maybeProtocolStatus = (() => {
        const {protocol} = socket;
        if (protocol.length < 1) {
          return [];
        }
        return [
          m.line`Selected protocol: ${m.strong(protocol)}`,
        ];
      })();
      return ([
        connectionStatus,
      ]).concat(maybeProtocolStatus).concat([
        '',
        m.line`Type ${m.command('/disconnect')} to end the connection`,
      ]);
    })();
    const about = [
      m.line`${m.h1(`Dark WebSocket Terminal ${this._dwst.model.config.appVersion}`)}`,
    ];
    const beginnerInfo = [
      m.line`1. Create a test connection by typing ${m.command(`/connect ${this._dwst.model.config.echoServer}`)}`,
      '2. Type messages into the text input',
      '3. Click on DWST logo if you get lost',
    ];
    const helpReminder = [
      m.line`Type ${m.command('/help')} to see the full range of available commands`,
    ];
    const privacyReminder = [
      m.line`${m.help('Check', '#privacy', {warning: true})} privacy and tracking info`,
    ];
    const linkSection = [
      m.line`${
        m.link('https://github.com/dwst/dwst', 'GitHub')
      }${m.unsafe(' &bull; ')}${
        m.link('https://gitter.im/dwst/dwst', 'chat')
      }${m.unsafe(' &bull; ')}${
        m.link('https://tools.ietf.org/html/rfc6455', 'rfc6455')
      }${m.unsafe(' &bull; ')}${
        m.link('https://www.iana.org/assignments/websocket/websocket.xhtml', 'iana')
      }`,
    ];
    const sections = (() => {
      if (this._dwst.model.connection.getSocket() !== null) {
        return [
          about,
          [''],
          statusSection,
          [''],
          helpReminder,
          [''],
          linkSection,
          [''],
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
          [''],
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
        [''],
      ];
    })();
    this._dwst.ui.terminal.gfx(shape, colors);
    this._dwst.ui.terminal.mlog([].concat(...sections), 'system');
  }

}
