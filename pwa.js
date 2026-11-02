(function () {
  "use strict";

  var deferredPrompt = null;
  var installed = false;
  var isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isStandalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;

  function installButton() {
    return document.getElementById("install-app-button");
  }

  function refreshInstallUI() {
    var button = installButton();
    if (!button) return;
    var isHttp = /^https?:$/.test(window.location.protocol);
    var canShow = !installed && !isStandalone && isHttp;
    button.hidden = !canShow;
    button.setAttribute("aria-hidden", canShow ? "false" : "true");
  }

  async function promptInstall() {
    if (installed || isStandalone) return { outcome: "installed" };
    if (deferredPrompt) {
      deferredPrompt.prompt();
      var choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      refreshInstallUI();
      return { outcome: choice && choice.outcome || "unknown" };
    }
    return { outcome: "instructions" };
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(window.location.protocol)) return;
    navigator.serviceWorker.register("./service-worker.js").catch(function (error) {
      console.warn("[PWA] service worker registration failed", error.message);
    });
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    refreshInstallUI();
  });

  window.addEventListener("appinstalled", function () {
    installed = true;
    deferredPrompt = null;
    refreshInstallUI();
  });

  if (window.matchMedia) {
    var media = window.matchMedia("(display-mode: standalone)");
    if (media.addEventListener) media.addEventListener("change", function (event) { isStandalone = event.matches; refreshInstallUI(); });
  }

  registerServiceWorker();
  document.addEventListener("DOMContentLoaded", refreshInstallUI);

  window.CareerOS = window.CareerOS || {};
  window.CareerOS.pwa = {
    refresh: refreshInstallUI,
    promptInstall: promptInstall,
    isIos: function () { return isIos; },
    isStandalone: function () { return isStandalone; }
  };
})();
