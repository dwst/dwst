
const appVersion = (() => {
  if (typeof VERSION === 'undefined') {
    return 'unknown-version';
  }
  return VERSION;
})();

export default {
  appVersion,
  echoServer: 'wss://echo.websocket.org/',
};
