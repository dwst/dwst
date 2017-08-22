
export default class Spam {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['spam'];
  }

  usage() {
    return [
      '/spam <times> [command line...]',
    ];
  }

  examples() {
    return [
      '/spam 10',
      '/spam 6 /binary [random(10)]',
    ];
  }

  info() {
    return 'run a command multiple times';
  }

  run(timesStr, ...commandParts) {
    const times = parseNum(timesStr);
    function spam(limit, i = 0) {
      if (i === limit) {
        return;
      }
      if (commandParts.length < 1) {
        run('send', String(i));
      } else {
        silent(commandParts.join(' '));
      }
      const nextspam = () => {
        spam(limit, i + 1);
      };
      if (connection !== null && connection.isOpen()) {
        setTimeout(nextspam, 0);
      } else {
        log('spam failed, no connection', 'error');
      }
    }
    spam(times);
  }
}

