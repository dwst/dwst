
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import chromePage from './chrome.js';
import commandsPage from './commands.js';
import developingPage from './developing.js';
import developmentPage from './development.js';
import firefoxPage from './firefox.js';
import introductionPage from './introduction.js';
import mainPage from './main.js';
import privacyPage from './privacy.js';
import styleguidePage from './styleguide.js';
import unprotectedPage from './unprotected.js';

function createBreadCrumbs(section = null) {
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

export default class Dwstgg {

  constructor(dwst) {
    this._dwst = dwst;
  }

  _helpPage(section) {
    if (section === '#main') {
      return mainPage();
    }
    if (section === '#chrome') {
      return chromePage();
    }
    if (section === '#firefox') {
      return firefoxPage();
    }
    if (section === '#developing') {
      return developingPage();
    }
    if (section === '#development') {
      return developmentPage();
    }
    if (section === '#styleguide') {
      return styleguidePage();
    }
    if (section === '#unprotected') {
      return unprotectedPage();
    }
    if (section === '#privacy') {
      return privacyPage();
    }
    if (section === '#introduction') {
      return introductionPage();
    }
    if (section === '#commands') {
      const commands = [...this._dwst.commands.keys()];
      return commandsPage(commands);
    }
    this._dwst.ui.terminal.log(`Unkown help page: ${section}`, 'error');
    return null;
  }

  _commandHelp(command) {
    const plugin = this._dwst.commands.get(command);
    if (typeof plugin === 'undefined') {
      this._dwst.ui.terminal.log(`the command does not exist: ${command}`, 'error');
      return null;
    }
    if (typeof plugin.usage === 'undefined') {
      this._dwst.ui.terminal.log(`no help available for: ${command}`, 'system');
      return null;
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

    return ([
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
    ]).concat(usage).concat([
      '',
      {
        type: 'h2',
        text: 'Examples',
      },
      '',
    ]).concat(examples).concat([
      '',
    ]);
  }

  _pageContent(section) {
    if (section.charAt(0) === '#') {
      return this._helpPage(section);
    }
    return this._commandHelp(section);
  }

  page(section) {
    const content = this._pageContent(section);
    if (content === null) {
      return null;
    }
    return ([
      createBreadCrumbs(section),
      '',
    ]).concat(content);
  }
}
