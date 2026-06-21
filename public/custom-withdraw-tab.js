/*
 * Admin ticket list — "提现 / Withdrawal" filter tab.
 *
 * Adds a third tab between 待回复 (pending) and 已关闭 (closed) on the admin ticket list
 * that filters the list down to system-generated commission-withdrawal requests, so staff
 * can review and process them quickly instead of scrolling the whole ticket list.
 *
 * No SPA rebuild required: this is a small progressive-enhancement script loaded from
 * admin.blade.php. While the tab is active it sets `is_withdraw: true` on the ticket-list
 * fetch (a flag the admin TicketController understands and matches against the localized
 * withdrawal subject across all installed locales). The native table then renders the
 * results with all native row actions (view / close) working unchanged.
 *
 * Everything is wrapped in try/catch so it can never break the admin panel.
 */
(function () {
  "use strict";
  if (window.__withdrawTabLoaded) return;
  window.__withdrawTabLoaded = true;

  var TAB_ID = "withdraw-filter-tab";
  var LABEL = "提现";                 // shown between 待回复 and 已关闭
  window.__withdrawMode = false;

  // ---------- rewrite the ticket-list fetch while the withdrawal tab is active ----------
  function isListFetch(url) {
    try { return /\/ticket\/fetch$/.test(String(url).split("?")[0]); } catch (e) { return false; }
  }
  function rewriteBody(body) {
    try {
      var o = JSON.parse(body);
      if (o && typeof o === "object" && Array.isArray(o.filter)) {
        // drop the tab's own status filter; keep any other active filters (e.g. priority/level)
        // so they compose with the withdrawal filter. Show them all on one page.
        o.filter = o.filter.filter(function (f) { return f && f.id !== "status"; });
        o.is_withdraw = true;
        o.pageSize = 200;
        o.current = 1;
        return JSON.stringify(o);
      }
    } catch (e) { /* leave untouched */ }
    return body;
  }
  try {
    var _fetch = window.fetch;
    window.fetch = function (u, o) {
      try {
        if (window.__withdrawMode && o && o.method && String(o.method).toUpperCase() === "POST" && isListFetch(u) && o.body) {
          o = Object.assign({}, o, { body: rewriteBody(o.body) });
        }
      } catch (e) {}
      return _fetch.call(this, u, o);
    };
  } catch (e) {}
  try {
    var _open = XMLHttpRequest.prototype.open;
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__wM = m; this.__wU = u; return _open.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function (b) {
      try {
        if (window.__withdrawMode && this.__wM && String(this.__wM).toUpperCase() === "POST" && isListFetch(this.__wU) && typeof b === "string") {
          b = rewriteBody(b);
        }
      } catch (e) {}
      return _send.call(this, b);
    };
  } catch (e) {}

  // ---------- helpers ----------
  function nativeTabs() {
    return Array.prototype.slice.call(document.querySelectorAll('[role=tab]')).filter(function (t) { return t.id !== TAB_ID; });
  }
  // any list-fetch trigger that is always present: a sortable column header button
  function triggerRefetch() {
    try {
      var hdr = Array.prototype.slice.call(document.querySelectorAll('th button, [role=columnheader] button, th, [role=columnheader]'))
        .find(function (e) { return /最后更新|创建时间|状态|优先级|Updated|Created|Status|Priority/i.test(e.textContent || ""); });
      if (hdr && hdr.tagName !== "BUTTON") { var b = hdr.querySelector("button,[role=button]"); if (b) hdr = b; }
      if (hdr) hdr.click();
    } catch (e) {}
  }
  // hide only the prev/next pager while in withdrawal mode (all rows are on one page)
  function setPagerHidden(hidden) {
    try {
      Array.prototype.slice.call(document.querySelectorAll('button')).forEach(function (b) {
        var t = (b.textContent || "").trim();
        if (/^上一页$|^下一页$|^Previous$|^Next$/.test(t) && !b.closest('table')) {
          b.style.display = hidden ? "none" : "";
        }
      });
    } catch (e) {}
  }
  function markActive() {
    try {
      var wd = document.getElementById(TAB_ID); if (!wd) return;
      var tabs = nativeTabs();
      if (window.__withdrawMode) {
        wd.setAttribute("data-state", "active"); wd.setAttribute("aria-selected", "true");
        tabs.forEach(function (t) { t.setAttribute("data-state", "inactive"); t.setAttribute("aria-selected", "false"); });
      } else {
        wd.setAttribute("data-state", "inactive"); wd.setAttribute("aria-selected", "false");
      }
    } catch (e) {}
  }

  // ---------- inject the tab + wire handlers ----------
  function injectTab() {
    try {
      var bar = document.querySelector('[role=tablist]'); if (!bar) return;
      var tabs = nativeTabs(); if (tabs.length < 2) return;

      if (!document.getElementById(TAB_ID)) {
        var closed = tabs.find(function (t) { return /已关闭|Closed/i.test((t.textContent || "").trim()); });
        var sample = tabs[0];
        var btn = document.createElement("button");
        btn.type = "button"; btn.id = TAB_ID; btn.setAttribute("role", "tab");
        btn.className = sample.className;
        btn.textContent = LABEL;
        btn.addEventListener("click", function (e) {
          e.preventDefault(); e.stopPropagation();
          window.__withdrawMode = true;
          setPagerHidden(true);
          triggerRefetch();
          setTimeout(markActive, 80);
        });
        bar.insertBefore(btn, closed || null);
        if (bar.classList.contains("grid-cols-2")) { bar.classList.remove("grid-cols-2"); bar.classList.add("grid-cols-3"); }
      }

      // leaving withdrawal mode: the injected tab is not a real Radix tab, so Radix's selected
      // value never moved off the tab the user came from — returning to that same tab is a no-op
      // for Radix (no re-render). So assert the clicked tab's active state ourselves + refetch.
      tabs.forEach(function (t) {
        if (t.__withdrawHooked) return; t.__withdrawHooked = true;
        t.addEventListener("click", function () {
          if (!window.__withdrawMode) return;
          var self = this;
          window.__withdrawMode = false;
          setPagerHidden(false);
          setTimeout(function () {
            nativeTabs().forEach(function (x) {
              var on = (x === self);
              x.setAttribute("data-state", on ? "active" : "inactive");
              x.setAttribute("aria-selected", on ? "true" : "false");
            });
            var wd = document.getElementById(TAB_ID);
            if (wd) { wd.setAttribute("data-state", "inactive"); wd.setAttribute("aria-selected", "false"); }
            triggerRefetch();
          }, 30);
        }, true);
      });
    } catch (e) {}
  }

  try {
    new MutationObserver(function () { injectTab(); markActive(); }).observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  injectTab();
})();
