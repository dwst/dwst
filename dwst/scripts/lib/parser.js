
/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST template expression parser

import Parsee from '../types/parsee.js';
import errors from './errors.js';
const {InvalidTemplateExpression} = errors;
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
const hexChars = charCodeRange('a', 'f').concat(digitChars);
const smallChars = charCodeRange('a', 'z');
const bigChars = charCodeRange('A', 'Z');
const alphaChars = smallChars.concat(bigChars);

const functionNameChars = alphaChars;
const functionArgChars = smallChars.concat(digitChars);

function quote(string) {
  return `"${string}"`;
}

function skipSpace(parsee) {
  while (parsee.read(' ')) {
    // empty while on purpose
  }
}

function readTemplateExpressionByte(parsee) {
  const hex = parsee.readWhile(hexChars, 2);
  if (hex.length < 2) {
    throw new InvalidTemplateExpression(['hex digit'], String(parsee));
  }
  const value = parseInt(hex, 16);
  return {type: 'byte', value};
}

function readTemplateExpressionCodePoint(parsee) {
  let hex;
  if (parsee.read('{')) {
    hex = parsee.readWhile(hexChars, 6);
    if (hex.length < 1) {
      throw new InvalidTemplateExpression(['hex digit'], String(parsee));
    }
    if (parsee.length === 0) {
      throw new InvalidTemplateExpression(['hex digit', '"}"'], String(parsee));
    }
    if (parsee.read('}') === false) {
      throw new InvalidTemplateExpression(['"}"'], String(parsee));
    }
  } else {
    hex = parsee.readWhile(hexChars, 4);
    if (hex.length < 1) {
      throw new InvalidTemplateExpression(['hex digit', '"{"'], String(parsee));
    }
    if (hex.length < 4) {
      throw new InvalidTemplateExpression(['hex digit'], String(parsee));
    }
  }
  const value = parseInt(hex, 16);
  return {type: 'codepoint', value};
}

function readTemplateExpressionEscape(parsee) {
  const mapping = [
    ['\\', '\\'],
    ['$', '$'],
    ['n', '\x0a'],
    ['r', '\x0d'],
    ['0', '\x00'],
    ['x', null],
    ['u', null],
  ];
  if (parsee.read('x')) {
    return readTemplateExpressionByte(parsee);
  }
  if (parsee.read('u')) {
    return readTemplateExpressionCodePoint(parsee);
  }
  if (parsee.length > 0) {
    for (const [from, to] of mapping) {
      if (parsee.read(from)) {
        return {type: 'text', value: to};
      }
    }
  }
  const expected = mapping.map(pair => pair[0]);
  throw new InvalidTemplateExpression(expected.map(quote), String(parsee));
}

function readTemplateExpressionText(parsee) {
  const value = parsee.readUntil(specialChars);
  return {type: 'text', value};
}

function skipExpressionOpen(parsee) {
  const expressionOpen = '{';
  if (parsee.read(expressionOpen) === false) {
    throw new InvalidTemplateExpression([expressionOpen].map(quote), String(parsee));
  }
}

function skipExpressionClose(parsee) {
  const expressionClose = '}';
  if (parsee.read(expressionClose) === false) {
    throw new InvalidTemplateExpression([expressionClose].map(quote), String(parsee));
  }
}

function skipArgListOpen(parsee) {
  const argListOpen = '(';
  if (parsee.read(argListOpen) === false) {
    throw new InvalidTemplateExpression([argListOpen].map(quote), String(parsee));
  }
}

function skipArgListClose(parsee) {
  const argListClose = ')';
  if (parsee.read(argListClose) === false) {
    throw new Error('unexpected return value');
  }
}

function readFunctionName(parsee) {
  const functionName = parsee.readWhile(functionNameChars);
  if (functionName.length === 0) {
    throw new InvalidTemplateExpression(['a function name'], String(parsee));
  }
  if (parsee.startsWith('}') || parsee.length === 0) {
    throw new InvalidTemplateExpression(['('].map(quote), String(parsee));
  }
  return functionName;
}

function readFunctionArg(parsee) {
  const arg = parsee.readWhile(functionArgChars);
  if (arg.length === 0) {
    const expected = ['an argument'];
    throw new InvalidTemplateExpression(expected, String(parsee));
  }
  return arg;
}

function readFunctionArgs(parsee) {
  const functionArgs = [];
  if (parsee.startsWith(')')) {
    return functionArgs;
  }
  if (functionArgChars.some(char => parsee.startsWith(char)) === false) {
    const expected = ['an argument'].concat([')'].map(quote));
    throw new InvalidTemplateExpression(expected, String(parsee));
  }

  while (true) {  // eslint-disable-line
    const arg = readFunctionArg(parsee);
    functionArgs.push(arg);
    skipSpace(parsee);
    if (parsee.startsWith(')')) {
      return functionArgs;
    }
    if (parsee.read(',') === false) {
      throw new InvalidTemplateExpression([',', ')'].map(quote), String(parsee));
    }
    skipSpace(parsee);
  }
}

function readExpression(parsee) {
  const name = readFunctionName(parsee);
  skipArgListOpen(parsee);
  skipSpace(parsee);
  const args = readFunctionArgs(parsee);
  skipSpace(parsee);
  skipArgListClose(parsee);
  return {type: 'function', name, args};
}

function readParticle(parsee) {
  if (parsee.read('\\')) {
    return readTemplateExpressionEscape(parsee);
  }
  if (parsee.read('$')) {
    skipExpressionOpen(parsee);
    skipSpace(parsee);
    const expression = readExpression(parsee);
    skipSpace(parsee);
    skipExpressionClose(parsee);
    return expression;
  }
  return readTemplateExpressionText(parsee);
}

function readTemplateExpression(parsee) {
  const particles = [];
  while (parsee.length > 0) {
    const particle = readParticle(parsee);
    particles.push(particle);
  }
  return {type: 'templateExpression', particles};
}

function parseTemplateExpression(templateExpression) {
  const parsee = new Parsee(templateExpression);
  try {
    return readTemplateExpression(parsee);
  } catch (e) {
    if (e instanceof InvalidTemplateExpression) {
      e.expression = templateExpression;
    }
    throw e;
  }
}

function escapeForTemplateExpression(textString) {
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
  parseTemplateExpression,
  escapeForTemplateExpression,
};
