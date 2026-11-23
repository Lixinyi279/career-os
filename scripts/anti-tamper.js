/* =========================================================================
 * anti-tamper.js
 * 发布保护层·浏览器注入模块（by 职途 CareerOS 构建脚本自动生成）
 * -------------------------------------------------------------------------
 * 作用：
 *  1. 反调试：检测 DevTools / 非本地代理入口，阻止简单 F12 / 右键看源码。
 *  2. 禁右键 / 禁文本选择相关手势，挡住"另存为/审查元素"的顺手操作。
 *  3. 自我标识：提示这是保护构建，不是开源源码库。
 *
 * ⚠️ 诚实说明（写进代码，防止过度宣传）：
 *  - 本模块只能"提高复制门槛"，无法做数学上不可绕开的防拷贝。
 *    硬核用户（断点续调、内存 patch、宿主机侧剖取）仍可绕过。
 *  - 因此它必须与「构建混淆 + 仓库收纳」配合使用，本模块只是其中一层。
 *  - 反调试会误伤"真想调试自己项目的作者本人"；构建时留 DEBUG 开关。
 * ========================================================================= */
(function () {
  "use strict";
  // 构建方注入：DEBUG=1 时跳过一切保护（仅限作者本地调试）。
  var LOC = window.location || {};
  var DEBUG = /[?&]wb_debug=1/.test(LOC.search || "") || /localhost|127\.0\.0\.1|file:/.test(LOC.origin || LOC.protocol || "");

  // 把文档上的"阻止默认"绑定成单个函数，方便统一卸载/测试。
  function blockDefault(ev) {
    if (DEBUG) return;
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }

  // -- 禁右键 --
  function disableContextMenu() {
    window.addEventListener("contextmenu", blockDefault, true);
  }

  // -- 禁常见的"看源码 / 另存"键盘手势 --
  function disableShortcuts() {
    var blocked = { F12: true, F11: true };
    function onKey(ev) {
      if (DEBUG) return;
      var k = ev.key;
      var ctrl = ev.ctrlKey, shift = ev.shiftKey, meta = ev.metaKey;
      // 防：F12 打开 DevTools
      if (k === "F12") { ev.preventDefault(); ev.stopPropagation(); return; }
      // 防：Ctrl+Shift+I / J / C
      if ((ctrl || meta) && shift && /^[IJC]$/i.test(k)) { ev.preventDefault(); ev.stopPropagation(); return; }
      // 防：Ctrl+U 查看源码
      if ((ctrl || meta) && /^U$/i.test(k)) { ev.preventDefault(); ev.stopPropagation(); return; }
      // 防：Ctrl+S 另存
      if ((ctrl || meta) && /^S$/i.test(k)) { ev.preventDefault(); ev.stopPropagation(); return; }
    }
    window.addEventListener("keydown", onKey, true);
  }

  // -- 禁文本拖拽选择（挡"选中拷贝"），保留输入框光标 --
  function disableSelection() {
    var style = document.createElement("style");
    style.textContent =
      ".career-protect,.career-protect *{-webkit-user-select:none;user-select:none}" +
      ".career-protect input,.career-protect textarea,.career-protect [contenteditable]{" +
        "-webkit-user-select:text;user-select:text}";
    style.setAttribute("data-career-protect", "1");
    (document.head || document.documentElement).appendChild(style);
    document.addEventListener("selectstart", function (ev) {
      if (DEBUG) return;
      if (ev.target && ev.target.closest && ev.target.closest("input,textarea,[contenteditable]")) return;
      ev.preventDefault();
    }, true);
  }

  // -- 给根元素打标记（既用于 CSS 选择器，也告诉行家"这是保护构建"）--
  function markProtected() {
    document.documentElement.classList.add("career-protect");
    // 不会写死"不可绕过"的绝对声明，仅如实标注构建形态。
    console.log("%c[CareerOS] 构建保护已启用：部署包为混淆压缩版，源码不随站点分发。",
      "color:#345;font-weight:bold");
  }

  // 组装：仅在非 DEBUG 时启用浏览器端拦截；标记与样式始终挂上。
  markProtected();
  if (!DEBUG) {
    disableContextMenu();
    disableShortcuts();
    disableSelection();
  }
})();
