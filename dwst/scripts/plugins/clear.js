

export default class Clear {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['clear'];
  }

  usage() {
    return [
      '/clear',
    ];
  }

  examples() {
    return [
      '/clear',
    ];
  }

  info() {
    return 'clear the screen';
  }

  run() {
    this._dwst.clearLog();
  }
}
