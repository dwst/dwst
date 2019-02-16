
/**

  Authors: Toni Ruottu, Finland 2010-2019

  This file is part of Dark WebSocket Terminal.

  CC0 1.0 Universal, http://creativecommons.org/publicdomain/zero/1.0/

  To the extent possible under law, Dark WebSocket Terminal developers have waived all
  copyright and related or neighboring rights to Dark WebSocket Terminal.

*/

import Terminal from './components/terminal.js';
import Clock from './components/clock.js';
import Prompt from './components/prompt.js';
import SendButton from './components/send_button.js';
import MenuButton from './components/menu_button.js';
import Screen from './components/screen.js';
import AutoScrollButton from './components/auto_scroll_button.js';
import ScrollNotification from './components/scroll_notification.js';
import FileInput from './components/file_input.js';

export default class Ui {

  constructor(dwst) {
    this._dwst = dwst;
    this._resizePending = false;

    this.terminal = new Terminal(this._dwst);
    this.clock = new Clock(this._dwst);
    this.prompt = new Prompt(this._dwst);
    this.sendButton = new SendButton(this._dwst);
    this.menuButton = new MenuButton(this._dwst);
    this.screen = new Screen(this._dwst);
    this.autoScrollButton = new AutoScrollButton(this._dwst);
    this.scrollNotification = new ScrollNotification(this._dwst);
    this.fileInput = new FileInput(this._dwst);
  }

  globalKeyPress(event) {
    if (event.key === 'Escape') {
      if (this._dwst.model.connection.getSocket() === null) {
        this.prompt.offerConnect();
      } else {
        this._dwst.controller.prompt.loud('/disconnect');
      }
    }
  }

  updateGfxPositions() {
    // Updating gfx positions with this method disables basic centering
    // and aligns the text in the gfx section with the text in log lines.
    const MAX_MAXCHARS = 110;
    Reflect.apply(Array.prototype.forEach, this._element.getElementsByClassName('dwst-gfx'), [maxDiv => {
      const [ref] = maxDiv.getElementsByClassName('dwst-gfx__line');
      const refTextWidth = ref.offsetWidth;
      const refTextLength = ref.textContent.length;
      const refWidth = refTextWidth / refTextLength;
      const windowWidth = window.innerWidth;
      const maxFit = Math.floor(windowWidth / refWidth);
      let leftMargin = 0;
      if (maxFit < MAX_MAXCHARS) {
        const invisible = MAX_MAXCHARS - maxFit;
        const invisibleLeft = Math.round(invisible / 2);
        leftMargin -= invisibleLeft;
      }
      const [field] = maxDiv.getElementsByClassName('dwst-gfx__content');
      field.setAttribute('style', `transform: initial; margin-left: ${leftMargin}ch;`);
    }]);
  }

  _throttledUpdateGfxPositions() {
    if (this._resizePending !== true) {
      this._resizePending = true;
      setTimeout(() => {
        this._resizePending = false;
        this.updateGfxPositions();
      }, 100);
    }
  }

  init(element) {
    this._element = element;
    this._element.addEventListener('keydown', evt => this.globalKeyPress(evt));
    this.terminal.init(element.getElementById('js-terminal'));
    this.clock.init(element.getElementById('js-clock'));
    this.prompt.init(element.getElementById('js-prompt'));
    this.sendButton.init(element.getElementById('js-send-button'));
    this.menuButton.init(element.getElementById('js-menu-button'));
    this.screen.init(element.getElementById('js-screen'));
    this.autoScrollButton.init(element.getElementById('js-auto-scroll-button'));
    this.scrollNotification.init(element.getElementById('js-scroll-notification'));
    this.fileInput.init(element.getElementById('js-file-input'));
    this._dwst.controller.prompt.silent('/splash');
    this.prompt.focus();
    window.addEventListener('resize', () => this._throttledUpdateGfxPositions());
  }

  onLoad() {
    this.clock.onLoad();
    this.updateGfxPositions();
  }
}
