import config from './config.js';

const VERSION = config.appVersion;

addEventListener('install', evt => {
  const staticAssets = [
    'styles/dwst.css',
    'scripts/dwst.js',
    'images/sprite.png',
    'images/favicon.png',
    'images/favicon.ico',
    'images/icon_128.png',
    'images/icon_192.png',
    'images/icon_512.png',
    'manifest.json',
  ];
  const assetPaths = staticAssets.map(path => `/${VERSION}/${path}`);
  const entrypoints = ['/'];
  evt.waitUntil(caches.open(VERSION).then(cache => {
    cache.addAll(entrypoints.concat(assetPaths));
  }));
});

addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(response => {
    if (response) {
      return response;
    }
    return fetch(evt.request);
  }));
});

addEventListener('activate', evt => {
  evt.waitUntil(caches.keys().then(cachedVersions => {
    return Promise.all(cachedVersions.map(cachedVersion => {
      if (cachedVersion !== VERSION) {
        return caches.delete(cachedVersion);
      }
      return Promise.resolve(null);
    }));
  }));
});
