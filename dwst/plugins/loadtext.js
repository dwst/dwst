
export default class Loadtext {

  constructor(dwst) {
    this._dwst = dwst;
  }

  commands() {
    return ['loadtext'];
  }

  usage() {
    return [
      '/loadtext [variable] [encoding]',
    ];
  }

  examples() {
    return [
      '/loadtext',
      '/loadtext default',
      '/loadtext default utf-8',
    ];
  }

  info() {
    return 'load text data from a file';
  }

  run(variable = 'default', encoding) {
    const upload = document.getElementById('file1');
    upload.onchange = () => {
      const file = upload.files[0];
      const ff = document.getElementById('fileframe');
      ff.innerHTML = ff.innerHTML;
      const reader = new FileReader();
      reader.onload = function (e2) {
        const text = e2.target.result;
        texts.set(variable, text);
        log(`Text file ${file.fileName} (${text.length}B) loaded to "${variable}"`, 'system');
      };
      reader.readAsText(file, encoding);
    };
    upload.click();
  }
}

