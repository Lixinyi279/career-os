"use strict";

const CACHE_NAME = "career-os-v0.8.0";
const APP_SHELL = [
  "./",
  "./index.html",
  "./assets/styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./agent-core.js",
  "./model-gateway.js",
  "./job-fit.js",
  "./pwa.js",
  "./skills.career.js",
  "./skills.resume.js",
  "./skills.interview.js",
  "./skills.plan.js",
  "./skills.rewrite.js",
  "./skills.star.js",
  "./skills.pipeline.js",
  "./skills.evidence.js",
  "./skills.jobs.js",
  "./app.js"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(APP_SHELL); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE_NAME; }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(function (response) {
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put("./index.html", copy); });
      return response;
    }).catch(function () {
      return caches.match("./index.html").then(function (cached) { return cached || caches.match("./"); });
    }));
    return;
  }

  event.respondWith(caches.match(event.request).then(function (cached) {
    if (cached) return cached;
    return fetch(event.request).then(function (response) {
      if (!response || response.status !== 200 || response.type === "opaque") return response;
      var copy = response.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
      return response;
    });
  }));
});
