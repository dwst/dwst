
/**

  Authors: Toni Ruottu, Finland 2010-2018

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import DwstFunction from '../types/function.js';

export default class PromptHandler {

  constructor(dwst) {
    this._dwst = dwst;
  }

  _process(instr, params) {
    if (instr === 'default') {
      return params[0];
    }
    const func = this._dwst.model.variables.getVariable(instr);
    if (func === null) {
      throw new this._dwst.lib.errors.UnknownInstruction(instr);
    }
    if (func instanceof DwstFunction) {
      return func.run(params);
    }
    throw new this._dwst.lib.errors.InvalidDataType(instr, ['FUNCTION']);
  }

  _getChunks(paramString) {
    const parsed = this._dwst.lib.particles.parseParticles(paramString);
    const chunks = [];
    let current = null;
    parsed.forEach(particle => {
      const [instruction, ...args] = particle;
      const output = this._process(instruction, args);
      if (current === null) {
        current = output;
      } else if (typeof output !== typeof current) {
        chunks.push(current);
        current = output;
      } else if (typeof current === 'string') {
        current += output;
      } else {
        current = this._dwst.lib.utils.joinBuffers([current, output]);
      }
    });
    if (current !== null) {
      chunks.push(current);
      current = null;
    }
    return chunks;
  }

  run(command) {
    const [pluginName, ...params] = command.split(' ');
    const paramString = params.join(' ');

    const plugin = this._dwst.plugins.getPlugin(pluginName);
    if (plugin === null) {
      throw new this._dwst.lib.errors.UnknownCommand(pluginName);
    }
    if (plugin.functionSupport) {
      const paramChunks = this._getChunks(paramString);
      plugin.run(...paramChunks);
    } else {
      plugin.run(paramString);
    }
  }

  silent(line) {
    const noslash = line.substring(1);
    this.run(noslash);
  }

  loud(line) {
    this._dwst.ui.terminal.log(line, 'command');
    this.silent(line);
  }
}
