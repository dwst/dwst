'use strict';

chrome.app.runtime.onLaunched.addListener(() => {
  chrome.app.window.create('dwst.html', {
    bounds: {
      width: 800,
      height: 600,
    },
  });
});
