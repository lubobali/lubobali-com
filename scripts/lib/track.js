// lubobali.com visit tracker (Phase 8 T3) — BROWSER code. Put inside every
// page at build time by scripts/track.mjs (no extra request: the home page
// is at the 20-request Lighthouse budget). No cookies, no third parties.
// Sends small JSON events to LuBot's /api/track-click (the URL is this
// tag's data-endpoint, TRACK_URL at build time):
//   arrival / exit (+ seconds the page was visible), per page
//   click  (+ label, link) on links, buttons, chips, filters
//   typed  (+ box, text) only for boxes marked data-track-box; the server
//          masks emails and phone numbers. The site says so next to them.
// Sends nothing when the browser asks not to be tracked (Do Not Track /
// Global Privacy Control) or is a test robot (Lighthouse, webdriver).
// Tests: scripts/tests/track.test.mjs (runs the shipped copy in a fake browser).
(function (w, d) {
  "use strict";
  var me = d.currentScript;
  var endpoint = me && me.getAttribute("data-endpoint");
  var nav = w.navigator || {};
  if (!endpoint || !w.fetch) return;
  if (nav.doNotTrack === "1" || w.doNotTrack === "1" || nav.globalPrivacyControl === true) return;
  if (nav.webdriver || /lighthouse|headless/i.test(nav.userAgent || "")) return;

  var KEY = "portfolio_session_id"; // same key as the old Framer tracker
  var session;
  try {
    session = w.localStorage.getItem(KEY);
    if (!session) w.localStorage.setItem(KEY, (session = newSession()));
  } catch {
    session = newSession();
  }
  function newSession() {
    return "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
  }

  function pageName() {
    var p = w.location.pathname.replace(/\.html$/, "").replace(/\/+$/, "");
    return p === "" || p === "/index" ? "home" : p;
  }
  function clean(s, max) {
    return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max);
  }
  function send(tag, extra) {
    var body = {
      page_name: view.page,
      tag: tag,
      time_on_page: tag === "exit" ? Math.round(seen() / 1000) : 0,
      session_id: session,
      referrer: view.referrer,
      user_agent: nav.userAgent || "",
    };
    for (var k in extra) body[k] = extra[k];
    try {
      w.fetch(endpoint, {
        method: "POST",
        keepalive: true,
        mode: "cors",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(function () {});
    } catch {
      /* never break the page */
    }
  }

  // One view = one page. Visible time only; one exit per view.
  var view;
  function seen() {
    return view.visibleMs + (view.shownAt ? Date.now() - view.shownAt : 0);
  }
  function start(referrer) {
    view = { page: pageName(), referrer: referrer, visibleMs: 0, shownAt: d.hidden ? 0 : Date.now(), exited: false };
    send("arrival");
  }
  function end() {
    flushTyped();
    if (view.exited) return;
    view.exited = true;
    send("exit");
  }
  start(d.referrer || "");

  d.addEventListener("visibilitychange", function () {
    if (d.hidden) {
      if (view.shownAt) view.visibleMs += Date.now() - view.shownAt;
      view.shownAt = 0;
      end();
    } else if (!view.shownAt) view.shownAt = Date.now();
  });
  w.addEventListener("pagehide", end);

  // Next.js changes pages without a reload: a new path = a new view.
  function moved() {
    if (pageName() === view.page) return;
    var from = w.location.origin + (view.page === "home" ? "/" : view.page);
    end();
    start(from);
  }
  ["pushState", "replaceState"].forEach(function (name) {
    var original = w.history[name];
    w.history[name] = function () {
      var out = original.apply(this, arguments);
      moved();
      return out;
    };
  });
  w.addEventListener("popstate", moved);

  // Clicks: the nearest link, button, chip or filter. A <label> click is
  // skipped: the browser clicks its input next, and that one is counted.
  function trackable(el) {
    var tag = el.tagName;
    var type = (el.getAttribute("type") || "").toLowerCase();
    if (el.getAttribute("data-track") != null) return true;
    if (tag === "A" || tag === "BUTTON" || tag === "SUMMARY") return true;
    if (el.getAttribute("role") === "button") return true;
    return tag === "INPUT" && (type === "checkbox" || type === "radio");
  }
  function labelOf(el) {
    var named = el.getAttribute("data-track") || el.getAttribute("aria-label");
    if (named) return named;
    if (el.tagName === "INPUT") {
      for (var p = el.parentElement; p; p = p.parentElement) if (p.tagName === "LABEL") return p.textContent;
      return el.getAttribute("value") || el.getAttribute("name");
    }
    return el.textContent || el.getAttribute("title") || el.tagName.toLowerCase();
  }
  d.addEventListener(
    "click",
    function (e) {
      for (var el = e.target; el && el.tagName; el = el.parentElement) {
        if (el.tagName === "LABEL" && !trackable(el)) return;
        if (trackable(el)) {
          send("click", { target: clean(labelOf(el), 100), href: clean(el.getAttribute("href"), 300) || null });
          return;
        }
      }
    },
    true,
  );

  // Typed text: only boxes marked data-track-box. Search boxes are sent
  // after a short pause; every box when it loses focus. Same text once.
  var last = {};
  var waiting = {};
  function typed(el) {
    var box = el.getAttribute("data-track-box");
    var text = clean(el.value, 1000);
    if (!box || text.length < 2 || last[box] === text) return;
    last[box] = text;
    send("typed", { box: box, text: text });
  }
  function flushTyped() {
    for (var box in waiting) {
      clearTimeout(waiting[box].timer);
      typed(waiting[box].el);
    }
    waiting = {};
  }
  function box(e) {
    var el = e.target;
    return el && el.getAttribute && el.getAttribute("data-track-box") ? el : null;
  }
  d.addEventListener(
    "input",
    function (e) {
      var el = box(e);
      if (!el || (el.getAttribute("type") || "").toLowerCase() !== "search") return;
      var name = el.getAttribute("data-track-box");
      if (waiting[name]) clearTimeout(waiting[name].timer);
      waiting[name] = {
        el: el,
        timer: setTimeout(function () {
          delete waiting[name];
          typed(el);
        }, 1500),
      };
    },
    true,
  );
  d.addEventListener(
    "change",
    function (e) {
      var el = box(e);
      if (el) typed(el);
    },
    true,
  );
})(window, document);
