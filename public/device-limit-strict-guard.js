/*
 * Device-limit "Strict mode" confirmation guard for the Xboard admin panel.
 *
 * WHY
 *   Node configuration → "Device limit mode" has two values:
 *     - Relaxed (1): counts a subscriber's devices by UNIQUE source IP.
 *     - Strict  (0): SUMS the alive IPs reported by EVERY node.
 *   Strict mode is surprising and easy to enable by accident. Because one physical
 *   device routinely appears on multiple nodes at the same time — a client that
 *   latency-tests / auto-selects across the node list, or that uses both IPv4 and
 *   IPv6 — a single device can be counted as many, blow past the plan's device
 *   limit, and get force-disconnected. In practice this kicks legitimate users off
 *   and generates a wave of "can't connect / keeps dropping" support tickets.
 *
 *   This is a well-known foot-gun, so this guard shows a clear confirmation dialog
 *   before the setting can be flipped to Strict, explaining the consequence and
 *   requiring an explicit acknowledgement.
 *
 * HOW
 *   The admin SPA is a prebuilt bundle. Rather than rebuild it, this small script
 *   (loaded from resources/views/admin.blade.php) intercepts the admin config-save
 *   request (POST .../config/save). If the body sets device_limit_mode to Strict (0)
 *   it pauses the request and shows the dialog. Proceed → the original request is
 *   sent unchanged. Cancel → the request is dropped and the page reloads, so the
 *   control reverts to the saved value (settings auto-save per field, so nothing
 *   else is lost).
 *
 * SAFETY
 *   Every path is wrapped in try/catch so this can never throw into the SPA. On any
 *   parse/detection failure it FAILS OPEN (lets the request through, panel keeps
 *   working); it only acts when it can positively read device_limit_mode === 0.
 *
 * No build step, no SPA changes, no dependencies. Plain ES5.
 */
(function () {
  "use strict";
  if (window.__deviceLimitGuardLoaded) return;
  window.__deviceLimitGuardLoaded = true;

  var STRICT = 0;                 // app/Services/UserOnlineService.php — 0 = strict (sum), 1 = relaxed
  var FIELD = "device_limit_mode";
  var MODAL_ID = "device-limit-strict-guard-modal";
  var open = false;               // re-entrancy: never stack two dialogs / two pending saves

  // ---------- localized copy (falls back to English) ----------
  var I18N = {
    "en": {
      title: "Enable Strict device-limit mode?",
      tag: "Risky setting",
      body: "Strict mode counts a subscriber's devices by summing the active IPs reported by every node. Because one device can appear on multiple nodes at once — e.g. when the client latency-tests or auto-selects across your node list, or uses both IPv4 and IPv6 — a single device may be counted as many, exceed the plan's device limit, and be disconnected. This frequently kicks legitimate users off.",
      safe: "Relaxed mode counts unique IP addresses and is the safer default. Only enable Strict mode if you fully understand this behaviour.",
      ack: "I understand this may disconnect legitimate users.",
      cancel: "Cancel (recommended)",
      proceed: "Enable Strict mode"
    },
    "zh-CN": {
      title: "确认切换到「严格」设备限制模式？",
      tag: "高风险设置",
      body: "严格模式按「每个节点上报的在线 IP 之和」统计用户设备数。由于同一台设备可能同时出现在多个节点上（例如客户端对节点列表测速 / 自动选择，或同时使用 IPv4 与 IPv6），一台设备可能被算成多台，从而超过套餐设备上限并被断开连接，经常导致正常用户被误踢下线。",
      safe: "宽松模式按唯一 IP 统计，是更安全的默认值。请仅在完全了解该行为后再启用严格模式。",
      ack: "我已了解此设置可能导致正常用户被断开连接。",
      cancel: "取消（推荐）",
      proceed: "仍要启用严格模式"
    },
    "zh-TW": {
      title: "確認切換到「嚴格」裝置限制模式？",
      tag: "高風險設定",
      body: "嚴格模式以「每個節點回報的線上 IP 之和」統計使用者裝置數。由於同一台裝置可能同時出現在多個節點上（例如用戶端對節點清單測速 / 自動選擇，或同時使用 IPv4 與 IPv6），一台裝置可能被計為多台，從而超過方案裝置上限並被中斷連線，經常導致正常使用者被誤踢下線。",
      safe: "寬鬆模式以唯一 IP 統計，是較安全的預設值。請僅在完全了解該行為後再啟用嚴格模式。",
      ack: "我已了解此設定可能導致正常使用者被中斷連線。",
      cancel: "取消（建議）",
      proceed: "仍要啟用嚴格模式"
    },
    "ko": {
      title: "엄격(Strict) 기기 제한 모드로 전환하시겠습니까?",
      tag: "위험한 설정",
      body: "엄격 모드는 모든 노드가 보고한 활성 IP의 합계로 가입자의 기기 수를 계산합니다. 하나의 기기가 동시에 여러 노드에 나타날 수 있기 때문에(예: 클라이언트가 노드 목록을 지연 테스트/자동 선택하거나 IPv4와 IPv6를 함께 사용하는 경우) 한 기기가 여러 대로 계산되어 요금제의 기기 제한을 초과하고 연결이 끊길 수 있습니다. 이로 인해 정상 사용자가 자주 강제 종료됩니다.",
      safe: "완화(Relaxed) 모드는 고유 IP로 계산하며 더 안전한 기본값입니다. 이 동작을 완전히 이해한 경우에만 엄격 모드를 활성화하십시오.",
      ack: "이 설정이 정상 사용자의 연결을 끊을 수 있음을 이해합니다.",
      cancel: "취소 (권장)",
      proceed: "엄격 모드 활성화"
    }
  };
  function t() {
    try {
      var l = localStorage.getItem("i18nextLng") || localStorage.getItem("VUE_NAIVE_LOCALE") || document.documentElement.lang || "en";
      return I18N[l] || I18N[String(l).slice(0, 2)] || (String(l).slice(0, 2) === "zh" ? I18N["zh-CN"] : I18N["en"]);
    } catch (e) { return I18N["en"]; }
  }

  // ---------- request matching ----------
  function isConfigSave(url) {
    try { return /\/config\/save$/.test(String(url).split("?")[0].split("#")[0]); }
    catch (e) { return false; }
  }
  // Read device_limit_mode out of the request body (axios sends a JSON string).
  function readMode(body) {
    try {
      if (body == null) return undefined;
      if (typeof body === "string") {
        if (body.indexOf(FIELD) === -1) return undefined;
        var o = JSON.parse(body);
        return o && typeof o === "object" ? o[FIELD] : undefined;
      }
      if (typeof body === "object" && typeof body.get === "function") return body.get(FIELD); // FormData
      if (typeof body === "object") return body[FIELD];
    } catch (e) {}
    return undefined;
  }
  function isStrictFlip(body) {
    var v = readMode(body);
    return v !== undefined && v !== null && Number(v) === STRICT;
  }

  // ---------- confirm dialog ----------
  function confirmStrict() {
    return new Promise(function (resolve) {
      try {
        if (open) { resolve(false); return; }
        open = true;
        var s = t();

        var overlay = document.createElement("div");
        overlay.id = MODAL_ID;
        overlay.setAttribute("style", [
          "position:fixed", "inset:0", "z-index:2147483647",
          "background:rgba(0,0,0,.55)", "display:flex",
          "align-items:center", "justify-content:center", "padding:20px"
        ].join(";"));

        var card = document.createElement("div");
        card.setAttribute("style", [
          "max-width:560px", "width:100%", "background:#fff", "border-radius:14px",
          "overflow:hidden", "border:1px solid #f3c2c2",
          "box-shadow:0 24px 60px rgba(0,0,0,.35)",
          "font-family:system-ui,-apple-system,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif",
          "color:#1f2328"
        ].join(";"));

        var header = document.createElement("div");
        header.setAttribute("style", [
          "background:linear-gradient(135deg,#d32f2f,#b71c1c)", "color:#fff",
          "padding:16px 20px", "font-size:16px", "font-weight:700",
          "display:flex", "align-items:center", "gap:10px"
        ].join(";"));
        header.appendChild(document.createTextNode("⚠️ " + s.title));

        var tag = document.createElement("span");
        tag.textContent = s.tag;
        tag.setAttribute("style", "margin-left:auto;font-size:12px;font-weight:600;background:rgba(255,255,255,.22);padding:2px 8px;border-radius:999px;");
        header.appendChild(tag);

        var bodyWrap = document.createElement("div");
        bodyWrap.setAttribute("style", "padding:18px 20px;font-size:14px;line-height:1.7;");
        var p1 = document.createElement("p"); p1.setAttribute("style", "margin:0 0 12px;"); p1.textContent = s.body;
        var p2 = document.createElement("p"); p2.setAttribute("style", "margin:0 0 14px;color:#1a7f4b;"); p2.textContent = "✅ " + s.safe;

        var ackLabel = document.createElement("label");
        ackLabel.setAttribute("style", "display:flex;align-items:flex-start;gap:9px;cursor:pointer;font-size:13px;color:#b71c1c;");
        var ack = document.createElement("input"); ack.type = "checkbox";
        ack.setAttribute("style", "margin-top:3px;width:16px;height:16px;cursor:pointer;");
        var ackText = document.createElement("span"); ackText.textContent = s.ack;
        ackLabel.appendChild(ack); ackLabel.appendChild(ackText);

        bodyWrap.appendChild(p1); bodyWrap.appendChild(p2); bodyWrap.appendChild(ackLabel);

        var footer = document.createElement("div");
        footer.setAttribute("style", "display:flex;gap:10px;justify-content:flex-end;padding:14px 20px;background:#fafafa;border-top:1px solid #eee;");

        var cancelBtn = document.createElement("button");
        cancelBtn.type = "button"; cancelBtn.textContent = s.cancel;
        cancelBtn.setAttribute("style", "padding:8px 16px;border-radius:8px;border:0;cursor:pointer;font-size:14px;font-weight:600;background:#2a9d67;color:#fff;");

        var proceedBtn = document.createElement("button");
        proceedBtn.type = "button"; proceedBtn.textContent = s.proceed; proceedBtn.disabled = true;
        function styleProceed() {
          proceedBtn.setAttribute("style", "padding:8px 16px;border-radius:8px;border:1px solid #d32f2f;cursor:" +
            (proceedBtn.disabled ? "not-allowed" : "pointer") + ";font-size:13px;font-weight:600;background:#fff;color:#d32f2f;opacity:" +
            (proceedBtn.disabled ? ".5" : "1") + ";");
        }
        styleProceed();
        ack.addEventListener("change", function () { proceedBtn.disabled = !ack.checked; styleProceed(); });

        footer.appendChild(cancelBtn); footer.appendChild(proceedBtn);
        card.appendChild(header); card.appendChild(bodyWrap); card.appendChild(footer);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        function finish(result) {
          try { document.removeEventListener("keydown", onKey); } catch (e) {}
          try { overlay.parentNode && overlay.parentNode.removeChild(overlay); } catch (e) {}
          open = false;
          resolve(result);
        }
        function onKey(e) { if (e.key === "Escape") finish(false); }

        cancelBtn.addEventListener("click", function () { finish(false); });
        proceedBtn.addEventListener("click", function () { if (!proceedBtn.disabled) finish(true); });
        overlay.addEventListener("click", function (e) { if (e.target === overlay) finish(false); });
        document.addEventListener("keydown", onKey);
      } catch (e) {
        open = false;
        resolve(true); // fail open: if the dialog can't render, don't block the save
      }
    });
  }

  // ---------- fetch interception ----------
  try {
    var _fetch = window.fetch;
    if (typeof _fetch === "function") {
      window.fetch = function (input, init) {
        try {
          var url = typeof input === "string" ? input : (input && input.url) || "";
          var method = (init && init.method) || (input && input.method) || "GET";
          var body = init ? init.body : null;
          if (String(method).toUpperCase() === "POST" && isConfigSave(url)) {
            var self = this, args = arguments;
            var bodyPromise = (body == null && typeof Request !== "undefined" && input instanceof Request)
              ? input.clone().text().catch(function () { return undefined; })
              : Promise.resolve(body);
            return bodyPromise.then(function (resolvedBody) {
              if (!isStrictFlip(resolvedBody)) return _fetch.apply(self, args);
              return confirmStrict().then(function (ok) {
                if (ok) return _fetch.apply(self, args);   // proceed: original request unchanged
                // cancel: drop the request and reload so the control reverts to the saved value.
                try { window.location.reload(); } catch (e) {}
                return new Promise(function () {});         // page is reloading; never settle
              });
            });
          }
        } catch (e) { /* never throw into the SPA */ }
        return _fetch.apply(this, arguments);
      };
    }
  } catch (e) {}

  // ---------- XMLHttpRequest interception (axios uses XHR) ----------
  try {
    var _open = XMLHttpRequest.prototype.open;
    var _send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      try { this.__dlM = method; this.__dlU = url; } catch (e) {}
      return _open.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      var xhr = this;
      try {
        if (xhr.__dlM && String(xhr.__dlM).toUpperCase() === "POST" && isConfigSave(xhr.__dlU) && isStrictFlip(body)) {
          confirmStrict().then(function (ok) {
            try {
              if (ok) { _send.call(xhr, body); }           // proceed: original request unchanged
              else { window.location.reload(); }            // cancel: reload, control reverts
            } catch (e) {
              try { _send.call(xhr, body); } catch (x) {}   // last resort: don't strand the panel
            }
          });
          return; // defer the real send until the admin decides
        }
      } catch (e) { /* never throw */ }
      return _send.call(xhr, body);
    };
  } catch (e) {}
})();
