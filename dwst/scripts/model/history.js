
/**

  Authors: Toni Ruottu, Finland 2010-2018
           William Orr, US 2012

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

class ElementHistory {

  constructor(history = []) {
    if (!Array.isArray(history)) {
      throw new Error('invalid history saveState');
    }
    this.idx = -1;
    this.history = history;
  }

  get length() {
    return this.history.length;
  }

  getAll() {
    return this.history;
  }

  getNext() {
    if (this.idx > 0) {
      this.idx -= 1;
      return this.history[this.idx];
    }
    if (this.idx === 0) {
      this.idx -= 1;
      return '';
    }

    return '';
  }

  getPrevious() {
    if (this.history.length === 0) {
      return '';
    }
    if (this.idx + 1 < this.history.length) {
      this.idx += 1;
      return this.history[this.idx];
    }
    return this.history[this.history.length - 1];
  }

  gotoBottom() {
    this.idx = -1;
  }

  getLast() {
    return this.history[0];
  }

  addItem(item, edition, callback) {
    if (typeof item !== 'string') {
      throw new Error('invalid type');
    }
    if (item !== '' && item !== this.getLast()) {
      this.history.unshift(item);
      if (edition) {
        this.idx += 1;
      }
    }
    callback();
  }

  removeBottom() {
    this.history.shift();
  }

  getCurrent() {
    return this.history[this.idx];
  }

  getConnectCommands(cap) {
    const uniqueCommands = [];
    const commandsSet = new Set();
    for (const command of this.history) {
      if (command.startsWith('/connect ') && !commandsSet.has(command)) {
        uniqueCommands.push(command);
        commandsSet.add(command);
      }
      if (uniqueCommands.length >= cap) {
        return uniqueCommands;
      }
    }
    return uniqueCommands;
  }

}

export default class History {

  constructor(savedHistory, options) {
    this.save = options.save;
    this.history = new ElementHistory(savedHistory);
  }

  getHistoryLength() {
    return this.history.length;
  }

  getSummary() {
    const history = this.history.getAll();
    const historyLine = ['History '];
    if (history.length < 1) {
      historyLine.push('is empty');
    } else {
      historyLine.push('contains ');
      historyLine.push({
        type: 'strong',
        text: `${history.length}`,
      });
      if (history.length === 1) {
        historyLine.push(' command');
      } else {
        historyLine.push(' commands');
      }
    }
    return historyLine;
  }

  forget() {
    const emptyHistory = [];
    this.history = new ElementHistory(emptyHistory, {save: this.save});
    this.save(emptyHistory);
  }

  addItem(value, edition) {
    this.history.addItem(value, edition, () => {
      const history = this.history.getAll();
      this.save(history);
    });
  }

  getNext(value) {
    if (value !== this.history.getCurrent()) {
      this.addItem(value, true);
    }
    return this.history.getNext();
  }

  getPrevious(value) {
    if (value !== this.history.getCurrent()) {
      this.addItem(value, true);
    }
    return this.history.getPrevious();
  }

  select(value) {
    this.addItem(value);
    this.history.gotoBottom();
  }

  atBottom() {
    return this.history.idx === -1;
  }

  getConnectCommands(cap) {
    return this.history.getConnectCommands(cap);
  }
}

