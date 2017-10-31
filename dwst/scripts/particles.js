
/**

  Authors: Toni Ruottu, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// DWST particles templating language

function readDefaultParticleContent(remainder1) {
  // TODO
  const content = 'todo';
  const remainder = remainder1;
  return {content, remainder};
}

function skipExpressionOpen(remainder1) {
  // TODO: skip ${
  const remainder = remainder1;
  return remainder;
}

function skipExpressionClose(remainder1) {
  // TODO: skip }
  const remainder = remainder1;
  return remainder;
}

function skipArgListOpen(remainder1) {
  // TODO: skip (
  const remainder = remainder1;
  return remainder;
}

function skipArgSeparator(remainder1) {
  // TODO: skip ,
  const remainder = remainder1;
  return remainder;
}

function skipArgListClose(remainder1) {
  // TODO: skip )
  const remainder = remainder1;
  return remainder;
}

function readInstructionName(remainder1) {
  // TODO
  const instructionName = 'todo';
  const remainder = remainder1;
  return {instructionName, remainder};
}

function readInstructionArg(remainder1) {
  // TODO
  const arg = 'todo';
  const remainder = remainder1;
  return {arg, remainder};
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
    const {arg, remainder} = readInstructionArg(remainder);
    instructionArgs.push(arg);
    tmp = remainder;
  }
  const remainder = tmp;
  return {instructionArgs, remainder};
}

function parseExpression(remainder1) {
  const {instructionName, remainder2} = readInstructionName(remainder1);
  const remainder3 = skipArgListOpen(remainder2);
  const {instructionArgs, remainder4} = readInstructionArgs(remainder3);
  const remainder = skipArgListClose(remainder4);
  const particle = [instructionName].concat(instructionArgs);
  return {particle, remainder};
}

function readInstructionParticle(remainder1) {
  const remainder2 = skipExpressionOpen(remainder1);
  const {particle, remainder3} = parseExpression(remainder2);
  const remainder = skipExpressionClose(remainder3);
  return {particle, remainder};
}

function readDefaultParticle(remainder1) {
  const {content, remainder} = readDefaultParticleContent(remainder1);
  const particle = ['default', content];
  return {particle, remainder};
}

function readParticle(particleString) {
  if (particleString.chsrAt(0) === '$') {
    return readInstructionParticle(particleString);
  }
  return readDefaultParticle(particleString);
}

function *readParticles(particleString) {
  let tmp = particleString;
  while (tmp.length > 0) {
    const {particle, remainder} = readParticle(tmp);
    yield particle;
    tmp = remainder;
  }
}

export function parseParticles(particleString) {
  return Array.from(readParticles(particleString));
}

export default function lisb(paramString, processFunction, joinFunction) {
  return joinFunction(parseParticles(paramString).map(particle => {
    const [instruction, ...args] = particle;
    return processFunction(instruction, args, '');
  }));
}
