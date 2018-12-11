/**

  Authors: Toni Ruottu, Finland 2017-2018
           Lauri Kaitala, Finland 2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

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

function indexOfNone(inputString, chars) {
  const indices = inputString.split('').map(character => {
    return chars.includes(character);
  });
  const thisIndexOf = indices.indexOf(false);
  if (thisIndexOf === -1) {
    return inputString.length;
  }
  return thisIndexOf;
}

export default class Parsee {

  constructor(original) {
    this._remainder = original;
  }

  get length() {
    return this._remainder.length;
  }

  startsWith(str) {
    return this._remainder.startsWith(str);
  }

  read(str) {
    if (this._remainder.startsWith(str) === false) {
      return false;
    }
    this._remainder = this._remainder.slice(str.length);
    return true;
  }

  readUntil(stopChars) {
    const nextSpecialPos = indexOfAny(this._remainder, stopChars);
    let sliceIndex;
    if (nextSpecialPos === -1) {
      sliceIndex = this._remainder.length;
    } else {
      sliceIndex = nextSpecialPos;
    }
    const chars = this._remainder.slice(0, sliceIndex);
    this._remainder = this._remainder.slice(sliceIndex);
    return chars;
  }

  readWhile(allowChars, limit = Infinity) {
    const mismatch = indexOfNone(this._remainder, allowChars);
    const sliceIndex = Math.min(mismatch, limit);
    const chars = this._remainder.slice(0, sliceIndex);
    this._remainder = this._remainder.slice(sliceIndex);
    return chars;
  }

  toString() {
    return this._remainder;
  }
}

