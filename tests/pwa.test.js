"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("web app manifest and generated icons are installable assets", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "./");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
  assert.ok(manifest.icons.some((icon) => icon.purpose === "maskable"));
  for (const icon of manifest.icons) {
    const file = path.join(root, icon.src.replace(/^\.\//, ""));
    const data = fs.readFileSync(file);
    assert.equal(data.readUInt32BE(16), Number(icon.sizes.split("x")[0]));
    assert.equal(data.readUInt32BE(20), Number(icon.sizes.split("x")[1]));
  }
});

test("index exposes install UI and service worker registration", () => {
  const html = read("index.html");
  const pwa = read("pwa.js");
  assert.match(html, /rel="manifest"/);
  assert.match(html, /id="install-app-button"/);
  assert.match(html, /src="\.\/pwa\.js"/);
  assert.match(pwa, /serviceWorker\.register/);
});

test("service worker shell references existing local files", () => {
  const worker = read("service-worker.js");
  const shellBlock = worker.match(/const APP_SHELL = \[([\s\S]*?)\];/)[1];
  const entries = [...shellBlock.matchAll(/"\.\/([^"\n]+)"/g)].map((match) => match[1]);
  assert.ok(entries.length >= 20);
  for (const entry of entries) {
    assert.ok(fs.existsSync(path.join(root, entry)), "missing cached file: " + entry);
  }
});

test("one-click and Docker installation assets are present", () => {
  for (const file of ["start-career-os.cmd", "start-career-os.sh", "Dockerfile", ".dockerignore"]) {
    assert.ok(fs.existsSync(path.join(root, file)), "missing installer file: " + file);
  }
  assert.match(read("server.js"), /\.webmanifest/);
});
