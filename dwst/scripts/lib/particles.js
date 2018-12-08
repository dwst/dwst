
/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST particles templating language

import Parsee from './_parsee.js';
import errors from './errors.js';
const {InvalidParticles} = errors;
import utils from './utils.js';

const specialChars = [
  '$',
  '\\',
];

function charCodeRange(start, end) {
  const startCode = start.charCodeAt(0);
  const endCode = end.charCodeAt(0);
  const charCodes = utils.range(startCode, endCode + 1);
  return charCodes.map(charCode => String.fromCharCode(charCode));
}

const digitChars = charCodeRange('0', '9');
const smallChars = charCodeRange('a', 'z');
const bigChars = charCodeRange('A', 'Z');
const alphaChars = smallChars.concat(bigChars);

const instructionNameChars = alphaChars;
const instructionArgChars = smallChars.concat(digitChars);

function quote(string) {
  return `"${string}"`;
}

function skipSpace(parsee) {
  while (parsee.read(' ')) {
    // empty while on purpose
  }
}

function extractEscapedChar(parsee) {

  if (parsee.length === 0) {
    // TODO - what if it is the only character?
    throw new InvalidParticles(['$', '\\', 'n', 'r'].map(quote), String(parsee));
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
  throw new InvalidParticles(['$', '\\', 'n', 'r'].map(quote), String(parsee));
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
    throw new InvalidParticles([expressionOpen].map(quote), String(parsee));
  }
}

function skipExpressionClose(parsee) {
  const expressionClose = '}';
  if (parsee.read(expressionClose) === false) {
    throw new InvalidParticles([expressionClose].map(quote), String(parsee));
  }
}

function skipArgListOpen(parsee) {
  const argListOpen = '(';
  if (parsee.read(argListOpen) === false) {
    throw new InvalidParticles([argListOpen].map(quote), String(parsee));
  }
}

function skipArgListClose(parsee) {
  const argListClose = ')';
  if (parsee.read(argListClose) === false) {
    throw new Error('unexpected return value');
  }
}

function readInstructionName(parsee) {
  const instructionName = parsee.readWhile(instructionNameChars);
  if (instructionName.length === 0) {
    throw new InvalidParticles(['an instruction name'], String(parsee));
  }
  if (parsee.startsWith('}') || parsee.length === 0) {
    throw new InvalidParticles(['('].map(quote), String(parsee));
  }
  return instructionName;
}

function readInstructionArg(parsee) {
  const arg = parsee.readWhile(instructionArgChars);
  if (arg.length === 0) {
    const expected = ['an argument'];
    throw new InvalidParticles(expected, String(parsee));
  }
  return arg;
}

function readInstructionArgs(parsee) {
  const instructionArgs = [];
  if (parsee.startsWith(')')) {
    return instructionArgs;
  }
  if (instructionArgChars.some(char => parsee.startsWith(char)) === false) {
    const expected = ['an argument'].concat([')'].map(quote));
    throw new InvalidParticles(expected, String(parsee));
  }

  while (true) {  // eslint-disable-line
    const arg = readInstructionArg(parsee);
    instructionArgs.push(arg);
    skipSpace(parsee);
    if (parsee.startsWith(')')) {
      return instructionArgs;
    }
    if (parsee.read(',') === false) {
      throw new InvalidParticles([',', ')'].map(quote), String(parsee));
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

function tryParseParticles(particleString) {
  const parsedParticles = [];
  const parsee = new Parsee(particleString);
  while (parsee.length > 0) {
    const particle = readParticle(parsee);
    parsedParticles.push(particle);
  }
  return parsedParticles;
}

function parseParticles(particleString) {
  try {
    return tryParseParticles(particleString);
  } catch (e) {
    if (e instanceof InvalidParticles) {
      e.expression = particleString;
    }
    throw e;
  }
}

function escapeForParticles(textString) {
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

export default {
  parseParticles,
  escapeForParticles,
};
