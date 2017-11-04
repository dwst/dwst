
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

function extractEscapedChar(remainder1) {
  const remainder2 = remainder1.slice(1);
  if (remainder2 === '') {
    const msg = 'syntax error: looks like your last character is an escape. ';
    // TODO - what if it is the only character?
    throw new Error(msg);
  }
  const escapedChar = remainder2.charAt(0);
  let escapedIsSpecial = false;
  specialChars.forEach(character => {
    if (character === escapedChar) {
      escapedIsSpecial = true;
    }
  });
  if (escapedIsSpecial === false) {
    const msg = 'syntax error: don\'t escape normal characters. ';
    throw new Error(msg);
  }
  const remainder = remainder2.slice(1);
  return [escapedChar, remainder];
}

function getNextSpecialCharPosition(remainder1) {
  return specialChars.map(character => {
    const i = remainder1.indexOf(character);
    if (i < 0) {
      return 0;
    }
    return i;
  }).sort((a, b) => {
    return a - b;
  }).filter(i => i > 0)[0];
}

function readDefaultParticleContent(remainder1) {
  let content = '';
  let escapedChar;
  let remainder2 = remainder1;
  while (remainder2.length > 0) {
    if (remainder2.charAt(0) === '$') {
      break;
    }
    if (remainder2.charAt(0) === '\\') {
      [escapedChar, remainder2] = extractEscapedChar(remainder2);
      content += escapedChar;
    }
    const nextSpecialPos = getNextSpecialCharPosition(remainder2);
    let sliceIndex;
    if (typeof nextSpecialPos === 'undefined') {
      sliceIndex = remainder2.length;
    } else {
      sliceIndex = nextSpecialPos;
    }
    content += remainder2.slice(0, sliceIndex);
    remainder2 = remainder2.slice(sliceIndex);
  }
  return [content, remainder2];
}

function skipExpressionOpen(remainder1) {
  const expressionOpen = '${';
  if (remainder1.startsWith(expressionOpen) === false) {
    const msg = `expression needs to start with ${expressionOpen}`;
    throw new Error(msg);
  }
  const remainder = remainder1.slice(expressionOpen.length);
  return remainder;
}

function skipExpressionClose(remainder1) {
  const expressionClose = '}';
  if (remainder1.startsWith(expressionClose) === false) {
    const msg = `expression needs to end with ${expressionClose}`;
    throw new Error(msg);
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
    throw new Error(msg);
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
  const argSeparatorIndex = remainder1.indexOf(',');
  if (argSeparatorIndex === 0) {
    const msg = `broken particle argument: missing argument, remainder = ${remainder1}`;
    throw new Error(msg);
  }
  let sliceIndex;
  if (argSeparatorIndex === -1) {
    const argListCloseIndex = remainder1.indexOf(')');
    if (argListCloseIndex === -1) {
      const msg = `Expected ' or ), remainder = ${remainder1}`;
      throw new Error(msg);
    }
    sliceIndex = argListCloseIndex;
  } else {
    sliceIndex = argSeparatorIndex;
  }
  const arg = remainder1.slice(0, sliceIndex);
  if (arg.indexOf(' ') > -1) {
    const msg = 'syntax error: whitespace in instruction args';
    throw new Error(msg);
  }
  const remainder = remainder1.slice(sliceIndex);
  return [arg, remainder];
}

function readInstructionArgs(remainder1) {
  if (remainder1.charAt(0) === ',') {
    throw new Error('Unexpected comma.');
  }
  const instructionArgs = [];
  let tmp = remainder1;
  while (tmp.charAt(0) !== ')') {
    if (tmp.charAt(0) === ',') {
      tmp = skipArgSeparator(tmp);
    }
    const [arg, remainder2] = readInstructionArg(tmp);
    instructionArgs.push(arg);
    tmp = remainder2;
  }
  const remainder = tmp;
  return [instructionArgs, remainder];
}

function parseExpression(remainder1) {
  const [instructionName, remainder2] = readInstructionName(remainder1);
  const remainder3 = skipArgListOpen(remainder2);
  const [instructionArgs, remainder4] = readInstructionArgs(remainder3);
  const remainder = skipArgListClose(remainder4);
  const particle = [instructionName].concat(instructionArgs);
  return [particle, remainder];
}

function readInstructionParticle(remainder1) {
  const remainder2 = skipExpressionOpen(remainder1);
  const [particle, remainder3] = parseExpression(remainder2);
  const remainder = skipExpressionClose(remainder3);
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

function *readParticles(particleString) {
  let tmp = particleString;
  while (tmp.length > 0) {
    const [particle, remainder] = readParticle(tmp);
    yield particle;
    tmp = remainder;
  }
}

export function parseParticles(particleString) {
  return Array.from(readParticles(particleString));
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

export default function particles(paramString, processFunction, joinFunction) {
  return joinFunction(parseParticles(paramString).map(particle => {
    const [instruction, ...args] = particle;
    return processFunction(instruction, args);
  }));
}
