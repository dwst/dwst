
export default class Disconnect {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['disconnect'];
  }

  usage() {
    return [
      '/disconnect',
    ];
  }

  examples() {
    return [
      '/disconnect',
    ];
  }

  info() {
    return 'disconnect from a server';
  }

  run() {
    if (this._dwst.terminal.connection === null) {
      this._dwst.terminal.log('No connection to disconnect', 'warning');
    }
    const protocol = [];
    this._dwst.terminal.mlog([`Closing connection to ${this._dwst.connection.url}`].concat(protocol), 'system');
    this._dwst.connection.close();
  }
}

