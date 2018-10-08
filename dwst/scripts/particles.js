
/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST particles templating language

import Parsee from './parsee.js';
import {InvalidParticles} from './errors.js';
import utils from './utils.js';

const specialChars = [
  '$',
  '\\',
];

const legalInstructionNameChars = (() => {
  const aCode = 'a'.charCodeAt(0);
  const zCode = 'z'.charCodeAt(0);
  const charCodes = utils.range(aCode, zCode + 1);
  return charCodes.map(charCode => String.fromCharCode(charCode));
})();

function skipSpace(parsee) {
  while (parsee.read(' ')) {
    // empty while on purpose
  }
}

function extractEscapedChar(parsee) {

  if (parsee.length === 0) {
    const msg = 'syntax error: looks like your last character is an escape. ';
    // TODO - what if it is the only character?
    throw new InvalidParticles(msg);
  }
  if (parsee.read('n')) {
    return '\x0a';
  }
  if (parsee.read('r')) {
    return '\x0d';
  }
  for (const specialChar of specialChars) {
    if (parsee.read(specialChar)) {
      return specialChar;
    }
  }
  const msg = 'syntax error: don\'t escape normal characters. ';
  throw new InvalidParticles(msg);
}

function extractRegularChars(parsee) {
  return parsee.readUntil(specialChars);
}

function readCharBlock(parsee) {
  if (parsee.read('\\')) {
    return extractEscapedChar(parsee);
  }
  return extractRegularChars(parsee);
}

function readDefaultParticleContent(parsee) {
  const charBlocks = [];
  while (parsee.length > 0 && parsee.startsWith('$') === false) {
    const charBlock = readCharBlock(parsee);
    charBlocks.push(charBlock);
  }
  const content = charBlocks.join('');
  return content;
}

function skipExpressionOpen(parsee) {
  const expressionOpen = '{';
  if (parsee.read(expressionOpen) === false) {
    const msg = `expression needs to start with ${expressionOpen}`;
    throw new InvalidParticles(msg);
  }
}

function skipExpressionClose(parsee) {
  const expressionClose = '}';
  if (parsee.read(expressionClose) === false) {
    const msg = `expression needs to end with ${expressionClose}`;
    throw new InvalidParticles(msg);
  }
}

function skipArgListOpen(parsee) {
  const argListOpen = '(';
  if (parsee.read(argListOpen) === false) {
    const msg = `missing ${argListOpen}`;
    throw new InvalidParticles(msg);
  }
}

function skipArgListClose(parsee) {
  const argListClose = ')';
  if (parsee.read(argListClose) === false) {
    throw new Error('unexpected return value');
  }
}

function readInstructionName(parsee) {
  const instructionName = parsee.readWhile(legalInstructionNameChars);
  if (instructionName.length === 0) {
    const msg = `broken named particle: missing instruction name, remainder = ${parsee}`;
    throw new InvalidParticles(msg);
  }
  if (parsee.length === 0) {
    const msg = `broken named particle: missing arg list open, remainder = ${parsee}`;
    throw new InvalidParticles(msg);
  }
  return instructionName;
}

function readInstructionArg(parsee) {
  const arg = parsee.readUntil([' ', ',', ')']);
  if (arg.length === 0) {
    const msg = `broken particle argument: missing argument, remainder = ${parsee}`;
    throw new InvalidParticles(msg);
  }
  if (parsee.length === 0) {
    const msg = `Expected ' or ), remainder = ${parsee}`;
    throw new InvalidParticles(msg);
  }
  return arg;
}

function readInstructionArgs(parsee) {
  const instructionArgs = [];
  if (parsee.startsWith(')')) {
    return instructionArgs;
  }
  while (true) {  // eslint-disable-line
    const arg = readInstructionArg(parsee);
    instructionArgs.push(arg);
    skipSpace(parsee);
    if (parsee.startsWith(')')) {
      return instructionArgs;
    }
    if (parsee.read(',') === false) {
      const msg = 'syntax error: garbage';
      throw new InvalidParticles(msg);
    }
    skipSpace(parsee);
  }
}

function parseExpression(parsee) {
  const instructionName = readInstructionName(parsee);
  skipArgListOpen(parsee);
  skipSpace(parsee);
  const instructionArgs = readInstructionArgs(parsee);
  skipSpace(parsee);
  skipArgListClose(parsee);
  const particle = [instructionName].concat(instructionArgs);
  return particle;
}

function readInstructionParticle(parsee) {
  skipExpressionOpen(parsee);
  skipSpace(parsee);
  const particle = parseExpression(parsee);
  skipSpace(parsee);
  skipExpressionClose(parsee);
  return particle;
}

function readDefaultParticle(parsee) {
  const content = readDefaultParticleContent(parsee);
  const particle = ['default', content];
  return particle;
}

function readParticle(parsee) {
  if (parsee.read('$')) {
    return readInstructionParticle(parsee);
  }
  return readDefaultParticle(parsee);
}

export function parseParticles(particleString) {
  const parsedParticles = [];
  const parsee = new Parsee(particleString);
  while (parsee.length > 0) {
    const particle = readParticle(parsee);
    parsedParticles.push(particle);
  }
  return parsedParticles;
}

export function escapeForParticles(textString) {
  const replmap = [
    ['$', '\\$'],
    ['\\', '\\\\'],
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
  const complete = replacer(textString, replmap);
  return complete;
}

export default parseParticles;
