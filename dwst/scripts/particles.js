
/**

  Authors: Toni Ruottu, Finland 2017
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST particles templating language

const specialChars = [
  '$',
  '\\',
];

export class InvalidParticles extends Error { }

function skipSpace(remainder1) {
  let tmp = remainder1;
  while (tmp.charAt(0) === ' ') {
    tmp = tmp.slice(1);
  }
  const remainder = tmp;
  return remainder;
}

function extractEscapedChar(remainder1) {
  const remainder2 = remainder1.slice(1);
  if (remainder2 === '') {
    const msg = 'syntax error: looks like your last character is an escape. ';
    // TODO - what if it is the only character?
    throw new InvalidParticles(msg);
  }
  const escapedChar = remainder2.charAt(0);
  if (specialChars.includes(escapedChar) === false) {
    const msg = 'syntax error: don\'t escape normal characters. ';
    throw new InvalidParticles(msg);
  }
  const remainder = remainder2.slice(1);
  return [escapedChar, remainder];
}

function indexOfAny(inputString, chars) {
  const indices = new Set(chars.map(character => {
    return inputString.indexOf(character);
  }));
  indices.delete(-1);
  if (indices.size === 0) {
    return -1;
  }
  return Math.min(...indices);
}

function extractRegularChars(remainder1) {
  const nextSpecialPos = indexOfAny(remainder1, specialChars);
  let sliceIndex;
  if (nextSpecialPos === -1) {
    sliceIndex = remainder1.length;
  } else {
    sliceIndex = nextSpecialPos;
  }
  const chars = remainder1.slice(0, sliceIndex);
  const remainder = remainder1.slice(sliceIndex);
  return [chars, remainder];
}

function readCharBlock(remainder1) {
  if (remainder1.charAt(0) === '\\') {
    return extractEscapedChar(remainder1);
  }
  return extractRegularChars(remainder1);
}

function readDefaultParticleContent(remainder1) {
  const charBlocks = [];
  let tmp = remainder1;
  while (tmp.length > 0 && tmp.charAt(0) !== '$') {
    const [charBlock, blockRemainder] = readCharBlock(tmp);
    charBlocks.push(charBlock);
    tmp = blockRemainder;
  }
  const content = charBlocks.join('');
  const remainder = tmp;
  return [content, remainder];
}

function skipExpressionOpen(remainder1) {
  const expressionOpen = '${';
  if (remainder1.startsWith(expressionOpen) === false) {
    const msg = `expression needs to start with ${expressionOpen}`;
    throw new InvalidParticles(msg);
  }
  const remainder = remainder1.slice(expressionOpen.length);
  return remainder;
}

function skipExpressionClose(remainder1) {
  const expressionClose = '}';
  if (remainder1.startsWith(expressionClose) === false) {
    const msg = `expression needs to end with ${expressionClose}`;
    throw new InvalidParticles(msg);
  }
  const remainder = remainder1.slice(expressionClose.length);
  return remainder;
}

function skipArgListOpen(remainder1) {
  const argListOpen = '(';
  const remainder = remainder1.slice(argListOpen.length);
  return remainder;
}

function skipArgSeparator(remainder1) {
  const argSeparator = ',';
  const remainder = remainder1.slice(argSeparator.length);
  return remainder;
}

function skipArgListClose(remainder1) {
  const argListClose = ')';
  const remainder = remainder1.slice(argListClose.length);
  return remainder;
}

function readInstructionName(remainder1) {
  const argListOpenIndex = remainder1.indexOf('(');
  if (argListOpenIndex === 0) {
    const msg = `broken named particle: missing instruction name, remainder = ${remainder1}`;
    throw new InvalidParticles(msg);
  }
  if (argListOpenIndex === -1) {
    const msg = `broken named particle: missing arg list open, remainder = ${remainder1}`;
    throw new InvalidParticles(msg);
  }
  let sliceIndex;
  if (argListOpenIndex === -1) {
    sliceIndex = remainder.length;
  } else {
    sliceIndex = argListOpenIndex;
  }
  const instructionName = remainder1.slice(0, sliceIndex);
  const remainder = remainder1.slice(sliceIndex);
  return [instructionName, remainder];
}

function readInstructionArg(remainder1) {
  const nextBreakIndex = indexOfAny(remainder1, [' ', ',', ')']);
  if (nextBreakIndex === 0) {
    const msg = `broken particle argument: missing argument, remainder = ${remainder1}`;
    throw new InvalidParticles(msg);
  }
  if (nextBreakIndex === -1) {
    const msg = `Expected ' or ), remainder = ${remainder1}`;
    throw new InvalidParticles(msg);
  }
  const arg = remainder1.slice(0, nextBreakIndex);
  const remainder = remainder1.slice(nextBreakIndex);
  return [arg, remainder];
}

function readInstructionArgs(remainder1) {
  const instructionArgs = [];
  if (remainder1.charAt(0) === ')') {
    return [instructionArgs, remainder1];
  }
  let tmp = remainder1;
  while (true) {  // eslint-disable-line
    const [arg, instructionRemainder] = readInstructionArg(tmp);
    instructionArgs.push(arg);
    tmp = skipSpace(instructionRemainder);
    if (tmp.charAt(0) === ')') {
      const remainder = tmp;
      return [instructionArgs, remainder];
    }
    if (tmp.charAt(0) !== ',') {
      const msg = 'syntax error: garbage';
      throw new InvalidParticles(msg);
    }
    tmp = skipArgSeparator(tmp);
    tmp = skipSpace(tmp);
  }
}

function parseExpression(remainder1) {
  const [instructionName, remainder2] = readInstructionName(remainder1);
  const remainder3 = skipArgListOpen(remainder2);
  const remainder4 = skipSpace(remainder3);
  const [instructionArgs, remainder5] = readInstructionArgs(remainder4);
  const remainder6 = skipSpace(remainder5);
  const remainder = skipArgListClose(remainder6);
  const particle = [instructionName].concat(instructionArgs);
  return [particle, remainder];
}

function readInstructionParticle(remainder1) {
  const remainder2 = skipExpressionOpen(remainder1);
  const remainder3 = skipSpace(remainder2);
  const [particle, remainder4] = parseExpression(remainder3);
  const remainder5 = skipSpace(remainder4);
  const remainder = skipExpressionClose(remainder5);
  return [particle, remainder];
}

function readDefaultParticle(remainder1) {
  const [content, remainder] = readDefaultParticleContent(remainder1);
  const particle = ['default', content];
  return [particle, remainder];
}

function readParticle(particleString) {
  if (particleString.charAt(0) === '$') {
    return readInstructionParticle(particleString);
  }
  return readDefaultParticle(particleString);
}

export function parseParticles(particleString) {
  const parsedParticles = [];
  let tmp = particleString;
  while (tmp.length > 0) {
    const [particle, remainder] = readParticle(tmp);
    parsedParticles.push(particle);
    tmp = remainder;
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
