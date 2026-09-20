/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-f0c192c2'], (function (workbox) { 'use strict';

  self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-icon-512.png",
    "revision": "8ce4fed6713a41d15c83d9f9bbc66be8"
  }, {
    "url": "pwa-icon-192.png",
    "revision": "8ce4fed6713a41d15c83d9f9bbc66be8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "eb7daed37934ec94ffc4c82d5ec64eef"
  }, {
    "url": "pwa-192x192.png",
    "revision": "398ffab5a65d0c9bab8353c38a85cbb0"
  }, {
    "url": "index.html",
    "revision": "c7e73a8903f8c5eec55b880673ec1113"
  }, {
    "url": "icon.svg",
    "revision": "b472933d64ba1d69f268571d3387f675"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "11720f06648ba807017ca0da4a9e6687"
  }, {
    "url": "assets/index-NTFVYN3A.css",
    "revision": null
  }, {
    "url": "assets/index-BziYQjP-.js",
    "revision": null
  }, {
    "url": "assets/GLTFLoader-BKTrmjvO.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "11720f06648ba807017ca0da4a9e6687"
  }, {
    "url": "icon.svg",
    "revision": "b472933d64ba1d69f268571d3387f675"
  }, {
    "url": "pwa-192x192.png",
    "revision": "398ffab5a65d0c9bab8353c38a85cbb0"
  }, {
    "url": "pwa-512x512.png",
    "revision": "eb7daed37934ec94ffc4c82d5ec64eef"
  }, {
    "url": "manifest.webmanifest",
    "revision": "6845e9a1eaabd74846ca86e9b6ab73b9"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
