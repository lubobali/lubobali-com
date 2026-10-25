// node --test scripts/tests/track.test.mjs
// The visit tracker (Phase 8 T3) exactly as shipped (scripts/lib/track.mjs:
// comments stripped, put inside each page) run in a small fake browser:
// what it sends, and when it must send nothing. Also the build step.
import { test } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { injectTracker, trackEndpoint, trackerSource } from "../lib/track.mjs";

const SOURCE = trackerSource();
const ENDPOINT = "https://staging.lubot.ai/api/track-click";
const SAFARI = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15";

class El {
  constructor(tag, attrs = {}, kids = []) {
    this.tagName = tag.toUpperCase();
    this.attrs = attrs;
    this.parentElement = null;
    this.kids = [];
    this.value = attrs.value ?? "";
    this.text = "";
    for (const k of kids) {
      if (typeof k === "string") this.text += k;
      else this.add(k);
    }
  }
  add(kid) {
    kid.parentElement = this;
    this.kids.push(kid);
    return kid;
  }
  getAttribute(name) {
    return name in this.attrs ? this.attrs[name] : null;
  }
  get textContent() {
    return this.text + this.kids.map((k) => k.textContent).join("");
  }
}

function browser({ endpoint = ENDPOINT, path = "/", nav = {}, storage = {}, referrer = "", hidden = false } = {}) {
  const sent = [];
  const listeners = {};
  const on = (target) => (type, fn) => ((listeners[`${target}:${type}`] ??= []).push(fn));
  const fire = (target, type, event = {}) => (listeners[`${target}:${type}`] ?? []).forEach((fn) => fn(event));
  const timers = [];
  let now = 1_000_000;
  const location = { pathname: path, origin: "https://lubobali.com" };
  const history = {
    pushState(_s, _t, url) {
      location.pathname = url;
    },
    replaceState(_s, _t, url) {
      location.pathname = url.split("?")[0];
    },
  };
  const document = {
    currentScript: endpoint === null ? null : new El("script", { "data-endpoint": endpoint }),
    referrer,
    hidden,
    addEventListener: on("document"),
  };
  const window = {
    document,
    location,
    history,
    navigator: { userAgent: SAFARI, ...nav },
    localStorage: {
      getItem: (k) => storage[k] ?? null,
      setItem: (k, v) => (storage[k] = v),
    },
    fetch: (url, init) => {
      sent.push({ url, init, body: JSON.parse(init.body) });
      return Promise.resolve();
    },
    addEventListener: on("window"),
  };
  const context = {
    window,
    document,
    Date: { now: () => now },
    Math,
    JSON,
    String,
    setTimeout: (fn, ms) => timers.push({ fn, at: now + ms }) - 1,
    clearTimeout: (id) => timers[id] && (timers[id].fn = null),
  };
  vm.runInNewContext(SOURCE, context);
  return {
    sent,
    storage,
    document,
    window,
    fire,
    later(ms) {
      now += ms;
      for (const t of timers) if (t.fn && t.at <= now) [t.fn, t.fn = null][0]();
    },
    click(el) {
      fire("document", "click", { target: el });
    },
    tags: () => sent.map((s) => s.body.tag),
  };
}

test("no endpoint on the tag = nothing is sent", () => {
  assert.equal(browser({ endpoint: null }).sent.length, 0);
  assert.equal(browser({ endpoint: "" }).sent.length, 0);
});

for (const [why, nav] of [
  ["Do Not Track", { doNotTrack: "1" }],
  ["Global Privacy Control", { globalPrivacyControl: true }],
  ["webdriver robots", { webdriver: true }],
  ["Lighthouse", { userAgent: "Mozilla/5.0 (Linux; Android 11) Chrome/141 Mobile Safari/537.36 Chrome-Lighthouse" }],
  ["headless Chrome", { userAgent: "Mozilla/5.0 HeadlessChrome/141.0" }],
]) {
  test(`${why}: nothing is sent`, () => {
    const b = browser({ nav });
    b.fire("document", "visibilitychange");
    assert.equal(b.sent.length, 0);
  });
}

test("arrival: one JSON POST, keepalive, no cookies, home for /", () => {
  const b = browser({ referrer: "https://www.linkedin.com/" });
  assert.equal(b.sent.length, 1);
  const { url, init, body } = b.sent[0];
  assert.equal(url, ENDPOINT);
  assert.equal(init.method, "POST");
  assert.equal(init.keepalive, true);
  assert.equal(init.credentials, "omit");
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.deepEqual(
    { ...body, session_id: "x" },
    {
      page_name: "home",
      tag: "arrival",
      time_on_page: 0,
      session_id: "x",
      referrer: "https://www.linkedin.com/",
      user_agent: SAFARI,
    },
  );
});

test("the session id is the Framer one when it exists, else a new kept one", () => {
  const old = browser({ storage: { portfolio_session_id: "sess_1_abc" } });
  assert.equal(old.sent[0].body.session_id, "sess_1_abc");
  const storage = {};
  const fresh = browser({ storage });
  assert.match(fresh.sent[0].body.session_id, /^sess_\d+_[a-z0-9]+$/);
  assert.equal(storage.portfolio_session_id, fresh.sent[0].body.session_id);
});

test("page names: path without trailing slash or .html", () => {
  assert.equal(browser({ path: "/projects/" }).sent[0].body.page_name, "/projects");
  assert.equal(browser({ path: "/about.html" }).sent[0].body.page_name, "/about");
});

test("exit: once, with the seconds the page was visible", () => {
  const b = browser();
  b.later(42_000);
  b.document.hidden = true;
  b.fire("document", "visibilitychange");
  b.later(600_000); // tab in the background: not counted
  b.document.hidden = false;
  b.fire("document", "visibilitychange");
  b.document.hidden = true;
  b.fire("document", "visibilitychange");
  b.fire("window", "pagehide");
  assert.deepEqual(b.tags(), ["arrival", "exit"]);
  assert.equal(b.sent[1].body.time_on_page, 42);
});

test("a new page without a reload = exit for the old page + arrival for the new", () => {
  const b = browser({ path: "/" });
  b.later(5_000);
  b.window.history.pushState(null, "", "/about");
  assert.deepEqual(b.tags(), ["arrival", "exit", "arrival"]);
  assert.equal(b.sent[1].body.page_name, "home");
  assert.equal(b.sent[1].body.time_on_page, 5);
  assert.equal(b.sent[2].body.page_name, "/about");
  assert.equal(b.sent[2].body.referrer, "https://lubobali.com/");
});

test("same page, new query string (filters) = no new view", () => {
  const b = browser({ path: "/projects" });
  b.window.history.replaceState(null, "", "/projects?tech=python");
  assert.deepEqual(b.tags(), ["arrival"]);
});

test("click on a link: its text and where it goes", () => {
  const b = browser();
  const a = new El("a", { href: "https://calendly.com/lubo/30min" }, [new El("span", {}, ["Book a call"])]);
  b.click(a.kids[0]);
  assert.deepEqual(
    { tag: b.sent[1].body.tag, target: b.sent[1].body.target, href: b.sent[1].body.href },
    { tag: "click", target: "Book a call", href: "https://calendly.com/lubo/30min" },
  );
});

test("click label: data-track first, then aria-label, capped at 100", () => {
  const b = browser();
  b.click(new El("button", { "data-track": "Explore", "aria-label": "Open search" }, ["⌘K"]));
  b.click(new El("button", { "aria-label": "Copy email address" }, ["📋"]));
  b.click(new El("button", {}, ["x".repeat(300)]));
  assert.deepEqual(
    b.sent.slice(1).map((s) => [s.body.target.length > 20 ? s.body.target.length : s.body.target, s.body.href]),
    [["Explore", null], ["Copy email address", null], [100, null]],
  );
});

test("a chip inside a label counts once, by its label text", () => {
  const b = browser();
  const input = new El("input", { type: "radio", name: "industry", value: "trucking" });
  const label = new El("label", {}, [input, new El("span", {}, ["🚚 Trucking"])]);
  b.click(label); // the browser then clicks the input
  b.click(input);
  assert.deepEqual(b.tags(), ["arrival", "click"]);
  assert.equal(b.sent[1].body.target, "🚚 Trucking");
});

test("a chip inside a clickable card still counts once", () => {
  const b = browser();
  const input = new El("input", { type: "checkbox", name: "tech" });
  const label = new El("label", {}, [input, "Python"]);
  new El("div", { role: "button" }, [label]);
  b.click(label);
  b.click(input);
  assert.deepEqual(b.tags(), ["arrival", "click"]);
  assert.equal(b.sent[1].body.target, "Python");
});

test("plain text clicks are not events", () => {
  const b = browser();
  b.click(new El("p", {}, ["just reading"]));
  assert.deepEqual(b.tags(), ["arrival"]);
});

test("typed: only boxes marked data-track-box; never email or unmarked boxes", () => {
  const b = browser();
  const email = new El("input", { type: "email", value: "jo@acme.com" });
  const unmarked = new El("textarea", { value: "secret notes" });
  const story = new El("textarea", { "data-track-box": "blueprint story" });
  story.value = "We have 40 trucks and   3 spreadsheets";
  for (const el of [email, unmarked, story]) b.fire("document", "change", { target: el });
  assert.deepEqual(b.tags(), ["arrival", "typed"]);
  assert.deepEqual(
    { box: b.sent[1].body.box, text: b.sent[1].body.text },
    { box: "blueprint story", text: "We have 40 trucks and 3 spreadsheets" },
  );
});

test("search boxes: sent after a pause, the final words once", () => {
  const b = browser({ path: "/projects" });
  const search = new El("input", { type: "search", "data-track-box": "projects search" });
  for (const words of ["a", "ai", "ai agent", "ai agents for clinics"]) {
    search.value = words;
    b.fire("document", "input", { target: search });
    b.later(400);
  }
  b.later(1_500);
  b.fire("document", "change", { target: search }); // blur after: same words, not sent again
  assert.deepEqual(b.tags(), ["arrival", "typed"]);
  assert.equal(b.sent[1].body.text, "ai agents for clinics");
});

test("leaving mid-typing still sends the words, before the exit", () => {
  const b = browser();
  const search = new El("input", { type: "search", "data-track-box": "explore search" });
  search.value = "databricks";
  b.fire("document", "input", { target: search });
  b.fire("window", "pagehide");
  assert.deepEqual(b.tags(), ["arrival", "typed", "exit"]);
});

test("typed text is capped at 1000 characters; 1 letter is not sent", () => {
  const b = browser();
  const fit = new El("textarea", { "data-track-box": "fit box" });
  fit.value = "y";
  b.fire("document", "change", { target: fit });
  fit.value = "z".repeat(5000);
  b.fire("document", "change", { target: fit });
  assert.equal(b.sent.length, 2);
  assert.equal(b.sent[1].body.text.length, 1000);
});

test("a broken network never breaks the page", () => {
  const b = browser();
  b.window.fetch = () => {
    throw new Error("offline");
  };
  assert.doesNotThrow(() => b.click(new El("a", { href: "/about" }, ["About"])));
});


// --- build step ---------------------------------------------------------------------------

test("TRACK_URL: not set = no tracker; wrong = the build fails", () => {
  assert.equal(trackEndpoint(undefined), null);
  assert.equal(trackEndpoint(""), null);
  assert.equal(trackEndpoint(ENDPOINT), ENDPOINT);
  for (const bad of ["staging.lubot.ai/api/track-click", "http://lubot.ai/api/track-click", "https://lubot.ai/api/x", `${ENDPOINT}?a=1`])
    assert.throws(() => trackEndpoint(bad), /TRACK_URL/, bad);
});

test("the tracker goes right before </body>, once", () => {
  const html = "<html><body><main>hi</main><script src=/_next/a.js></script></body></html>";
  const out = injectTracker(html, ENDPOINT, "SRC");
  assert.ok(out.endsWith(`<script id="lubo-track" data-endpoint="${ENDPOINT}">SRC</script></body></html>`));
  assert.throws(() => injectTracker(out, ENDPOINT, "SRC"), /already/);
  assert.throws(() => injectTracker("<p>no body</p>", ENDPOINT, "SRC"), /body/);
});

test("the shipped tracker has no comments and stays small", () => {
  assert.doesNotMatch(SOURCE, /^\s*\/\//m);
  assert.ok(SOURCE.length < 6000, `${SOURCE.length} bytes`);
});

// --- the site says what it saves (Lubo 2026-10-25, choice B) ------------------------------

import { readFileSync } from "node:fs";

const src = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("every box that sends its text says so next to it, and no page says the opposite", () => {
  const story = src("src/components/blueprint/start-form.tsx");
  const answers = src("src/components/blueprint/questions.tsx");
  const fitBox = src("src/components/resume/fit-box.tsx");
  const fitWords = src("src/lib/fit/copy.ts");
  const yourData = src("src/components/blueprint/your-data.tsx");
  assert.match(story, /data-track-box="blueprint story"/);
  assert.match(answers, /data-track-box="blueprint answer"/);
  assert.match(fitBox, /data-track-box="fit box"/);
  assert.match(story, /What you type is saved without your name/);
  assert.match(fitWords, /privacy: "Runs in your browser\. What you type is saved without your name/);
  assert.match(yourData, /"Visits"/);
  for (const [file, text] of [["start-form", story], ["fit copy", fitWords], ["your-data", yourData]])
    assert.doesNotMatch(text, /is not stored|Nothing you type is sent or saved|I don't store it|no tracking/, file);
});

test("the email box for the PDF copy is never marked", () => {
  assert.doesNotMatch(src("src/components/blueprint/copy-form.tsx"), /data-track-box/);
});
