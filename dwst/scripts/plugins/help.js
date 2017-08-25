
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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

export default class Help {

  constructor(dwst) {
    this._dwst = dwst;
  }

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
    [...this._dwst.commands.keys()].sort().forEach(c => {
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

    this._dwst.terminal.mlog([
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
      this._dwst.terminal.mlog(([
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
      this._dwst.terminal.mlog(([
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
      this._dwst.terminal.mlog(([
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
      this._dwst.terminal.mlog([
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
      this._dwst.terminal.mlog(([
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

    this._dwst.terminal.log(`Unkown help page: ${page}`, 'error');
  }

  _commandHelp(command) {
    const plugin = this._dwst.commands.get(command);
    if (typeof plugin === 'undefined') {
      this._dwst.terminal.log(`the command does not exist: ${command}`, 'error');
      return;
    }
    if (typeof plugin.usage === 'undefined') {
      this._dwst.terminal.log(`no help available for: ${command}`, 'system');
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

    this._dwst.terminal.mlog([
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

    this._dwst.terminal.clearLog();

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

