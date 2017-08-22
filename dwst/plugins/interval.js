
export default class Interval {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['interval'];
  }

  usage() {
    return [
      '/interval <interval> [command line...]',
      '/interval',
    ];
  }

  examples() {
    return [
      '/interval 1000',
      '/interval 1000 /binary [random(10)]',
      '/interval',
    ];
  }

  info() {
    return 'run an other command periodically';
  }

  run(intervalStr = null, ...commandParts) {
    if (intervalStr === null) {
      if (intervalId === null) {
        log('no interval to clear', 'error');
      } else {
        clearInterval(intervalId);
        log('interval cleared', 'system');
      }
      return;
    }
    let count = 0;
    const interval = parseNum(intervalStr);
    const spammer = () => {
      if (connection === null || !connection.isOpen()) {
        if (intervalId !== null) {
          log('interval failed, no connection', 'error');
          run('interval');
        }
        return;
      }
      if (commandParts.length < 1) {
        run('send', String(count));
        count += 1;
        return;
      }
      silent(commandParts.join(' '));
    };
    if (intervalId !== null) {
      log('clearing old interval', 'system');
      clearInterval(intervalId);
    }
    intervalId = setInterval(spammer, interval);
    log('interval set', 'system');
  }
}
