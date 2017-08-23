
export default class Bins {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['bins'];
  }

  usage() {
    return [
      '/bins [name]',
    ];
  }

  examples() {
    return [
      '/bins',
      '/bins default',
    ];
  }

  info() {
    return 'list loaded binaries';
  }

  run(variable = null) {
    if (variable !== null) {
      const buffer = bins.get(variable);
      if (typeof buffer !== 'undefined') {
        blog(buffer, 'system');
        return;
      }
      const listTip = [
        'List available binaries by typing ',
        {
          type: 'command',
          text: '/bins',
        },
        '.',
      ];
      mlog([`Binary "${variable}" does not exist.`, listTip], 'error');
      return;
    }
    const listing = [...bins.entries()].map(([name, buffer]) => {
      return `"${name}": <${buffer.byteLength}B of binary data>`;
    });
    const strs = ['Loaded binaries:'].concat(listing);
    mlog(strs, 'system');
  }
}
