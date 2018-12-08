
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import errors from '../../lib/errors.js';
const {UnknownCommand, UnknownHelpPage, UnknownInstruction} = errors;

import chromePage from './_chrome.js';
import commandsPage from './_commands.js';
import developingPage from './_developing.js';
import developmentPage from './_development.js';
import firefoxPage from './_firefox.js';
import functionsPage from './_functions.js';
import introductionPage from './_introduction.js';
import mainPage from './_main.js';
import privacyPage from './_privacy.js';
import styleguidePage from './_styleguide.js';
import simulatorPage from './_simulator.js';
import unprotectedPage from './_unprotected.js';

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
    if (section === '#simulator') {
      return simulatorPage();
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
      const commands = this._dwst.plugins.getNames();
      return commandsPage(commands);
    }
    if (section === '#functions') {
      const functions = this._dwst.functions.getNames();
      return functionsPage(functions);
    }
    throw new UnknownHelpPage(section);
  }

  _commandHelp(command) {
    const plugin = this._dwst.plugins.getPlugin(command);
    if (plugin === null) {
      throw new UnknownCommand(command);
    }
    if (typeof plugin.usage === 'undefined') {
      throw new UnknownHelpPage(command);
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

  _functionHelp(section) {
    const funcName = section.slice(0, -'()'.length);
    const func = this._dwst.functions.getFunction(funcName);
    if (func === null) {
      throw new UnknownInstruction(funcName);
    }
    if (typeof func.usage === 'undefined') {
      throw new UnknownHelpPage(funcName);
    }
    const usage = func.usage().map(usageExample => {
      return {
        type: 'syntax',
        text: usageExample,
      };
    });
    const examples = func.examples().map(exampleCommand => {
      return {
        type: 'command',
        text: exampleCommand,
      };
    });

    return ([
      [
        func.type(),
        ' ',
        {
          type: 'h1',
          text: `${section}`,
        },
        {
          type: 'regular',
          text: ' &ndash; ',
          unsafe: true,
        },
        func.info(),
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
    if (section.startsWith('#')) {
      return this._helpPage(section);
    }
    if (section.endsWith('()')) {
      return this._functionHelp(section);
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
