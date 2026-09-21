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
define(['./workbox-25613826'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "pwa-icon-512.png",
    "revision": "8ce4fed6713a41d15c83d9f9bbc66be8"
  }, {
    "url": "pwa-icon-192.png",
    "revision": "8ce4fed6713a41d15c83d9f9bbc66be8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "eb7daed37934ec94ffc4c82d5ec64eef"
  }, {
    "url": "pwa-512.png",
    "revision": "09d2eeb0ba95b2979527d47f7fc43060"
  }, {
    "url": "pwa-192x192.png",
    "revision": "398ffab5a65d0c9bab8353c38a85cbb0"
  }, {
    "url": "pwa-192.png",
    "revision": "09d2eeb0ba95b2979527d47f7fc43060"
  }, {
    "url": "index.html",
    "revision": "a69d7557570684851058da118aa58a8c"
  }, {
    "url": "icon.svg",
    "revision": "b472933d64ba1d69f268571d3387f675"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "11720f06648ba807017ca0da4a9e6687"
  }, {
    "url": "images/warriors_lineup.jpg",
    "revision": "203830fefd6584741ad6e77823ffba7f"
  }, {
    "url": "images/splash_background.jpg",
    "revision": "9c3769e5f6be819040fd7d3868e83c81"
  }, {
    "url": "images/reward_crate_burst.jpg",
    "revision": "c28691d098250ef4c3eb8e7d0ab15c0f"
  }, {
    "url": "images/dual_uzi.jpg",
    "revision": "11dc16c60efa44a739432cba56489987"
  }, {
    "url": "images/desert_eagle_gold.jpg",
    "revision": "0581409155b8c913e4d4f0f4c1cb2b3b"
  }, {
    "url": "images/crate_supply.jpg",
    "revision": "e3d0c7e672a13fd3e69f802ac6c3478e"
  }, {
    "url": "images/crate_mystery.jpg",
    "revision": "1de814271245773db2f3b2ea6f132b14"
  }, {
    "url": "images/crate_elite.jpg",
    "revision": "8fbff32b3601f3390b9d2c94de1a1b35"
  }, {
    "url": "images/commando_avatar.jpg",
    "revision": "33d9dede2ca96e8561b717dcd059769b"
  }, {
    "url": "images/character_customization.jpg",
    "revision": "2ca5e088c13177430bda094ecaf825b2"
  }, {
    "url": "images/arsenal_grid.jpg",
    "revision": "8553cfce47c6f045da5f295dac76e9ed"
  }, {
    "url": "images/app_logo.jpg",
    "revision": "625f443f0b58d35411d081bb79e61f73"
  }, {
    "url": "images/active_combat.jpg",
    "revision": "46b081c9e3243bef9b696f6355276efc"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/vendor-CCNoe7vs.js",
    "revision": null
  }, {
    "url": "assets/threeVendor-BmL3gDzS.js",
    "revision": null
  }, {
    "url": "assets/realistic_commando_1789736030533-aQdXZIq8.jpg",
    "revision": null
  }, {
    "url": "assets/military_arena_bg_1789831118619-DQm0e9a4.jpg",
    "revision": null
  }, {
    "url": "assets/index-edv1VNh-.css",
    "revision": null
  }, {
    "url": "assets/index-BTh6IPhQ.js",
    "revision": null
  }, {
    "url": "assets/GLTFLoader-BAWbxQrV.js",
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
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');

}));
