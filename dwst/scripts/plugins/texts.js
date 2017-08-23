
export default class Texts {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['texts'];
  }

  usage() {
    return [
      '/texts',
      '/texts [name]',
    ];
  }

  examples() {
    return [
      '/texts',
      '/texts default',
    ];
  }

  info() {
    return 'list loaded texts';
  }

  run(variable = null) {
    if (variable !== null) {
      const text = this._dwst.texts.get(variable);
      if (typeof text  !== 'undefined') {
        this._dwst.terminal.log(text, 'system');
        return;
      }
      const listTip = [
        'List available texts by typing ',
        {
          type: 'command',
          text: '/texts',
        },
        '.',
      ];
      this._dwst.terminal.mlog([`Text "${variable}" does not exist.`, listTip], 'error');
    }
    const listing = [...this._dwst.texts.entries()].map(([name, text]) => {
      return `"${name}": <${text.length}B of text data>`;
    });
    const strs = ['Loaded texts:'].concat(listing);
    this._dwst.terminal.mlog(strs, 'system');
  }
}

