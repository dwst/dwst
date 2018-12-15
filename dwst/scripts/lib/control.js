
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import Parsee from '../types/parsee.js';

const controlCharNames = {

  // C0 Controls

  '\x00': ['\\0', 'NUL', 'null terminator'],
  '\x01': [null, 'SOH', 'start of heading'],
  '\x02': [null, 'STX', 'start of text'],
  '\x03': [null, 'ETX', 'end of text'],
  '\x04': [null, 'EOT', 'end of transmission'],
  '\x05': [null, 'ENQ', 'enquiry'],
  '\x06': [null, 'ACK', 'acknowledge'],
  '\x07': [null, 'BEL', 'bell'],
  '\x08': [null, 'BS', 'backspace'],
  '\x09': [null, 'HT', 'horizontal tabulation'],
  '\x0a': ['\\n', 'LF', 'line feed'],
  '\x0b': [null, 'VT', 'vertical tabulation'],
  '\x0c': [null, 'FF', 'form feed'],
  '\x0d': ['\\r', 'CR', 'carriage return'],
  '\x0e': [null, 'SO', 'shift out'],
  '\x0f': [null, 'SI', 'shift in'],
  '\x10': [null, 'DLE', 'data link escape'],
  '\x11': [null, 'DC1', 'device control one'],
  '\x12': [null, 'DC2', 'device control two'],
  '\x13': [null, 'DC3', 'device control three'],
  '\x14': [null, 'DC4', 'device control four'],
  '\x15': [null, 'NAK', 'negative acknowledge'],
  '\x16': [null, 'SYN', 'synchronous idle'],
  '\x17': [null, 'ETB', 'end of transmission block'],
  '\x18': [null, 'CAN', 'cancel'],
  '\x19': [null, 'EM', 'end of medium'],
  '\x1a': [null, 'SUB', 'substitute'],
  '\x1b': [null, 'ESC', 'escape'],
  '\x1c': [null, 'FS', 'file separator'],
  '\x1d': [null, 'GS', 'group separator'],
  '\x1e': [null, 'RS', 'record separator'],
  '\x1f': [null, 'US', 'unit separator'],
  '\x7f': [null, 'DEL', 'delete'],

  // C1 Controls

  '\x80': [null, 'XXX', '<control>'],
  '\x81': [null, 'XXX', '<control>'],
  '\x82': [null, 'BPH', 'break permitted here'],
  '\x83': [null, 'NBH', 'no break here'],
  '\x84': [null, 'IND', 'index'],
  '\x85': [null, 'NEL', 'next line'],
  '\x86': [null, 'SSA', 'start of selected area'],
  '\x87': [null, 'ESA', 'end of selected area'],
  '\x88': [null, 'HTS', 'character tabulation set'],
  '\x89': [null, 'HTJ', 'character tabulation with justification'],
  '\x8a': [null, 'VTS', 'line tabulation set'],
  '\x8b': [null, 'PLD', 'partial line forward'],
  '\x8c': [null, 'PLU', 'partial line backward'],
  '\x8d': [null, 'RI', 'reverse line feed'],
  '\x8e': [null, 'SS2', 'single shift two'],
  '\x8f': [null, 'SS3', 'single shift three'],
  '\x90': [null, 'DCS', 'device control string'],
  '\x91': [null, 'PU1', 'private use one'],
  '\x92': [null, 'PU2', 'private use two'],
  '\x93': [null, 'STS', 'set transmit state'],
  '\x94': [null, 'CCH', 'cancel character'],
  '\x95': [null, 'MW', 'message waiting'],
  '\x96': [null, 'SPA', 'start of guarded area'],
  '\x97': [null, 'EPA', 'end of guarded area'],
  '\x98': [null, 'SOS', 'start of string'],
  '\x99': [null, 'XXX', '<control>'],
  '\x9a': [null, 'SCI', 'single character introducer'],
  '\x9b': [null, 'CSI', 'control sequence introducer'],
  '\x9c': [null, 'ST', 'string terminator'],
  '\x9d': [null, 'OSC', 'operating system command'],
  '\x9e': [null, 'PM', 'privacy message'],
  '\x9f': [null, 'APC', 'application program command'],

  // invisible Latin-1

  '\xa0': [null, 'NBSP', 'no-break space'],
  '\xad': [null, 'SHY', 'soft hyphen'],

};

const controlChars = Object.keys(controlCharNames);

function readOne(parsee) {
  for (const [chr, [nice, abbr, name]] of Object.entries(controlCharNames)) {
    if (parsee.read(chr)) {
      return {
        chr,
        nice,
        abbr,
        name,
      };
    }
  }
  return parsee.readUntil(controlChars);
}

export default function parseControlChars(msg) {
  const parts = [];
  const parsee = new Parsee(msg);
  while (parsee.length > 0) {
    const part = readOne(parsee);
    parts.push(part);
  }
  return parts;
}
