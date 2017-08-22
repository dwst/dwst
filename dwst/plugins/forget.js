
export default class Forget {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['forget'];
  }

  usage() {
    return [
      '/forget everything',
    ];
  }

  examples() {
    return [
      '/forget everything',
    ];
  }

  info() {
    return 'empty history';
  }

  _removeHistory() {
    historyManager.forget();
    const historyLine = historyManager.getSummary().concat(['.']);
    mlog(['Successfully forgot stored history!', historyLine], 'system');
  }

  run(target) {
    if (target === 'everything') {
      this._removeHistory();
      log("You may wish to use your browser's cleaning features to remove tracking cookies and other remaining traces.", 'warning');
    } else {
      const historyLine = historyManager.getSummary().concat(['.']);
      mlog([`Invalid argument: ${target}`, historyLine], 'error');
    }
  }

}
