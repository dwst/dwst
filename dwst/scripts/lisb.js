
/**

  Authors: Toni Ruottu, Finland 2010-2017

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

// LISB templating language -- "Lots of Irritating Square Brackets"

export default function lisb(paramString, processFunction, joinFunction) {
  return joinFunction(paramString.split(' ').map(rawParam => {
    let param = rawParam;
    /* eslint-disable prefer-template */
    if (param.substr(param.length - 2, 2) === '\\\\') {
      param = param.substr(0, param.length - 2) + '\\';
    } else if (param.substr(param.length - 1, 1) === '\\') {
      param = param.substr(0, param.length - 1) + ' ';
    }
    /* eslint-enable prefer-template */
    let instruction = 'default';
    let params = [];
    let end = '';
    if (param.substr(0, 2) === '\\\\') {
      params.push(param.substr(1));
    } else if (param.substr(0, 2) === '\\[') {
      params.push(param.substr(1));
    } else if (param.substr(0, 1) === '[') {
      const tmp = param.split(']');
      const call = tmp[0].split('[')[1];
      end = tmp[1];
      const tmp2 = call.split('(').concat('');
      instruction = tmp2[0];
      const pl = tmp2[1].split(')')[0];
      if (pl.length > 0) {
        params = pl.split(',');
      }
    } else {
      params.push(param);
    }
    return processFunction(instruction, params, end);
  }));
}
