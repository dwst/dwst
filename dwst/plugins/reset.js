
export default class Reset {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['reset'];
  }

  usage() {
    return [
      '/reset',
    ];
  }

  examples() {
    return [
      '/reset',
    ];
  }

  info() {
    return 'reset the message buffer';
  }

  run() {
    document.getElementById('ter1').innerHTML = '';
  }
}

