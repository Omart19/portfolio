/* OMART19 - shared page behaviour. Reads the settings in config.js; no libraries. */
(function () {
  "use strict";
  var SITE = window.SITE || {};
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function store(kind, key, value) {
    try {
      var s = window[kind];
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (e) { return null; }
  }

  // ---------------------------------------------------------------- clock + year
  var clocks = $$("[data-clock]");
  function tick() {
    var d = new Date();
    var t = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    clocks.forEach(function (c) { c.textContent = t; });
  }
  if (clocks.length) { tick(); setInterval(tick, 1000); }
  $$("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });

  // ---------------------------------------------------------------- screenshot viewer
  var viewer = document.getElementById("viewer");
  if (viewer) {
    var vImg = document.getElementById("viewer-img");
    var vCap = document.getElementById("viewer-cap");
    var open = function (src, alt, caption) {
      vImg.src = src;
      vImg.alt = alt || "";
      vCap.textContent = caption || "";
      if (typeof viewer.showModal === "function") viewer.showModal();
    };
    $$(".shot").forEach(function (b) {
      b.addEventListener("click", function () {
        var img = b.querySelector("img");
        open(b.dataset.full || img.src, img.alt, b.dataset.caption);
      });
    });
    $$(".prose img").forEach(function (img) {
      img.addEventListener("click", function () { open(img.src, img.alt, img.alt); });
    });
    viewer.addEventListener("click", function () { viewer.close(); });
  }

  // ---------------------------------------------------------------- tutorial contents: folded on phones
  if (window.matchMedia && window.matchMedia("(max-width: 980px)").matches) {
    $$("details.toc").forEach(function (d) { d.open = false; });
  }

  // ---------------------------------------------------------------- links from config.js
  // A link is "live" when its URL is set, otherwise it shows its data-off text and does nothing.
  function setLink(el, url) {
    var label = el.querySelector("[data-label]") || el;
    if (url) {
      el.href = url;
      el.classList.remove("pending");
      el.removeAttribute("aria-disabled");
      if (/^https?:\/\//.test(url)) { el.target = "_blank"; el.rel = "noopener"; }
      if (el.dataset.on) label.textContent = el.dataset.on;
    } else {
      el.removeAttribute("href");
      el.classList.add("pending");
      el.setAttribute("aria-disabled", "true");
      if (el.dataset.off) label.textContent = el.dataset.off;
    }
  }
  var urls = {
    patreon: SITE.patreon,
    ebay: SITE.ebay,
    youtube: SITE.youtube,
    instagram: SITE.instagram,
    tiktok: SITE.tiktok,
    github: SITE.github ? "https://github.com/" + SITE.github : "",
    steam: SITE.steamAppId ? "https://store.steampowered.com/app/" + encodeURIComponent(SITE.steamAppId) + "/" : "",
    reports: SITE.reportsRepo ? "https://github.com/" + SITE.reportsRepo + "/issues" : ""
  };
  $$("[data-link]").forEach(function (el) { setLink(el, urls[el.dataset.link] || ""); });
  // data-report="spider-bug.yml" opens that report form on GitHub
  $$("[data-report]").forEach(function (el) {
    setLink(el, SITE.reportsRepo ? "https://github.com/" + SITE.reportsRepo + "/issues/new?template=" + encodeURIComponent(el.dataset.report) : "");
  });
  // elements that only show once a link exists (e.g. the eBay banner)
  $$("[data-when]").forEach(function (el) { el.hidden = !urls[el.dataset.when]; });
  $$("[data-unless]").forEach(function (el) { el.hidden = !!urls[el.dataset.unless]; });

  // ---------------------------------------------------------------- downloads (signed release information)
  // The release tool publishes spider/latest.json (signed; S.P.I.D.E.R. checks the signature itself).
  // The page shows the newest version with a button per system and each file's SHA-256 for checking by hand.
  var siteRoot = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? new URL("../", s).href : document.baseURI;
  })();
  var platformNames = { "windows-x86_64": "Windows", "linux-x86_64": "Linux" };

  function initDownload(box) {
    var cfg = (SITE.downloads || {})[box.dataset.download];
    var q = function (s) { return box.querySelector(s); };
    var chip = q("[data-dl-chip]"), msg = q("[data-dl-msg]"), meta = q("[data-dl-meta]");
    var notes = q("[data-dl-notes]"), hashes = q("[data-dl-hashes]"), hashList = q("[data-dl-hashlist]");
    var buttons = $$("[data-dl-file]", box);

    function none() {
      chip.textContent = "Not released yet";
      chip.className = "chip warn";
      msg.textContent = box.dataset.none || "There is no public download yet.";
      buttons.forEach(function (b) { setLink(b, ""); });
    }
    function show(m) {
      var pre = String(m.version).indexOf("-") >= 0;
      chip.textContent = pre ? "Early access" : "Latest";
      chip.className = pre ? "chip hot" : "chip live";
      q("[data-dl-version]").textContent = m.version;
      q("[data-dl-date]").textContent = m.published ? new Date(m.published).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "-";
      meta.hidden = false;
      msg.textContent = "Signed release. Once installed, S.P.I.D.E.R. checks for updates itself and asks before installing.";
      hashList.textContent = "";
      buttons.forEach(function (b) {
        var f = m.files.filter(function (x) { return x.platform === b.dataset.dlFile; })[0];
        var safe = f && /^https:\/\/github\.com\//.test(f.url);
        if (!safe) { setLink(b, ""); return; }
        b.dataset.on = "Download for " + (platformNames[f.platform] || f.platform) + " · " + (f.size / 1048576).toFixed(0) + " MB";
        setLink(b, f.url);
        b.removeAttribute("target");
        hashList.appendChild(el("dt", "", f.name));
        hashList.appendChild(el("dd", "mono", f.sha256));
      });
      hashes.hidden = !hashList.childElementCount;
      if (m.notes) { notes.textContent = String(m.notes).slice(0, 1500); notes.hidden = false; }
      if (cfg.history) loadOlder(m.version);
    }

    // every earlier published version (spider/releases.json), newest first
    function loadOlder(current) {
      var box2 = q("[data-dl-older]"), list = q("[data-dl-older-list]"), more = q("[data-dl-older-more]"), all = q("[data-dl-releases]");
      if (!box2) return;
      if (all && /^https:\/\/github\.com\//.test(cfg.releasesPage || "")) all.href = cfg.releasesPage; else if (all) all.parentNode.hidden = true;
      fetch(new URL(cfg.history, siteRoot).href, { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
        .then(function (h) {
          if (h.product !== "spider" || !Array.isArray(h.releases)) return;
          var older = h.releases.filter(function (r) { return r && r.version && r.version !== current; });
          if (!older.length) return;
          older.forEach(function (r, i) {
            var li = el("li", "");
            if (i >= 5) li.hidden = true;
            var head = el("div", "dl-older-head");
            head.appendChild(el("b", "", "S.P.I.D.E.R. " + r.version));
            if (r.published) head.appendChild(el("span", "", new Date(r.published).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })));
            li.appendChild(head);
            var links = el("div", "dl-older-files");
            (r.files || []).forEach(function (f) {
              if (!f || !/^https:\/\/github\.com\//.test(f.url || "")) return;
              var a = el("a", "link", (platformNames[f.platform] || f.platform) + " · " + (f.size / 1048576).toFixed(0) + " MB");
              a.href = f.url;
              a.title = f.name + "  SHA-256 " + f.sha256;
              links.appendChild(a);
            });
            li.appendChild(links);
            if (r.notes) {
              var d = el("details", "dl-older-notes");
              d.appendChild(el("summary", "", "What changed"));
              d.appendChild(el("pre", "", String(r.notes).slice(0, 1500)));
              li.appendChild(d);
            }
            list.appendChild(li);
          });
          q("[data-dl-older-count]").textContent = "(" + older.length + ")";
          if (older.length > 5) {
            more.hidden = false;
            more.textContent = "Show all " + older.length + " older versions";
            more.addEventListener("click", function () {
              $$("li", list).forEach(function (li) { li.hidden = false; });
              more.hidden = true;
            });
          }
          box2.hidden = false;
        })
        .catch(function () { /* no history yet */ });
    }
    if (!cfg || !cfg.manifest) return none();
    fetch(new URL(cfg.manifest, siteRoot).href, { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (m) {
        if (m.product !== "spider" || !Array.isArray(m.files)) throw new Error("not a S.P.I.D.E.R. release");
        show(m);
      })
      .catch(none);
  }
  $$("[data-download]").forEach(initDownload);

  // ---------------------------------------------------------------- video links
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  $$("[data-videos]").forEach(function (box) {
    var list = ((SITE.videos || {})[box.dataset.videos] || []).filter(function (v) { return v && v.url; });
    if (!list.length) return;                 // keep the "on the way" note that is already in the page
    box.textContent = "";
    list.forEach(function (v) {
      var a = el("a", "card edge chamfer");
      a.href = v.url;
      a.target = "_blank";
      a.rel = "noopener";
      var inner = el("div", "inner chamfer");
      var pic = el("div", "pic");
      var yt = /(?:youtu\.be\/|[?&]v=|shorts\/|embed\/)([\w-]{11})/.exec(v.url);
      if (yt) pic.style.backgroundImage = "url(https://i.ytimg.com/vi/" + yt[1] + "/hqdefault.jpg)";
      var host = "";
      try { host = new URL(v.url).hostname.replace(/^www\./, ""); } catch (e) { host = "link"; }
      inner.appendChild(pic);
      inner.appendChild(el("h3", "", v.title || "Video"));
      inner.appendChild(el("span", "go", "Watch on " + host + " ↗"));
      a.appendChild(inner);
      box.appendChild(a);
    });
  });

  // ---------------------------------------------------------------- parts lists
  $$("[data-parts]").forEach(function (tbody) {
    var list = (SITE.parts || {})[tbody.dataset.parts] || [];
    if (!list.length) return;
    tbody.textContent = "";
    list.forEach(function (p) {
      var tr = document.createElement("tr");
      var name = el("td");
      name.appendChild(el("strong", "", p.part));
      if (p.detail) { name.appendChild(document.createElement("br")); name.appendChild(document.createTextNode(p.detail)); }
      tr.appendChild(name);
      tr.appendChild(el("td", "mono", p.qty || "1"));
      var where = el("td");
      if (p.url) {
        var a = el("a", "", "Get it ↗");
        a.href = p.url;
        a.target = "_blank";
        a.rel = "noopener";
        where.appendChild(a);
      } else if (SITE.ebay) {
        var shop = el("a", "", "Check my eBay shop ↗");
        shop.href = SITE.ebay;
        shop.target = "_blank";
        shop.rel = "noopener";
        where.appendChild(shop);
      } else {
        where.appendChild(el("span", "off", "link coming"));
      }
      tr.appendChild(where);
      tbody.appendChild(tr);
    });
  });

  // ---------------------------------------------------------------- employer form
  $$("form[data-hire]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    var send = form.querySelector("button[type=submit]");
    var endpoint = SITE.hireFormEndpoint;
    var openedAt = Date.now();
    var COOLDOWN = 15 * 60 * 1000;
    function say(state, text) { status.dataset.state = state; status.textContent = text; }

    if (!endpoint) say("off", "This form is not switched on yet, so nothing can be sent. Until it is, reach me through the other links on this page.");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!endpoint) return say("off", "This form is not switched on yet, so your message was not sent. Use the other links on this page for now.");
      if (!form.reportValidity()) return;
      var trap = form.querySelector(".hp input");
      if (trap && trap.value) { form.reset(); return say("ok", "Sent."); }          // a bot filled the hidden field
      if (Date.now() - openedAt < 4000) return say("err", "That was quick. Check your details, then press Send again.");
      var last = Number(store("localStorage", "hire-sent") || 0);
      if (Date.now() - last < COOLDOWN) {
        return say("err", "Your message already went through. You can send another in " + Math.ceil((COOLDOWN - (Date.now() - last)) / 60000) + " minutes.");
      }
      send.disabled = true;
      say("", "Sending...");
      fetch(endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; });
        })
        .then(function (res) {
          if (res.ok) {
            store("localStorage", "hire-sent", String(Date.now()));
            form.reset();
            say("ok", "Sent. Thank you. The reply will go to the email address you entered.");
          } else {
            var why = res.body && res.body.errors ? res.body.errors.map(function (x) { return x.message; }).join(" ") : "";
            say("err", (why || "The form service turned the message down.") + " Try again in a minute.");
          }
        })
        .catch(function () { say("err", "Could not reach the form service. Check your connection and press Send again."); })
        .then(function () { send.disabled = false; });
    });
  });
})();
