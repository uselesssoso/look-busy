(function (root) {
  var PAGE = "https://uselesssoso.github.io/look-busy/";
  var KEY = "look-busy-lang";
  var SCENES = ["video", "train", "export", "build"];
  var engine = root.LookBusyEngine;
  var copy = root.LookBusyCopy;

  var lang = document.documentElement.dataset.lang || "en";
  if (lang !== "en" && lang !== "ja" && lang !== "zh") lang = "en";

  var scene = "video";
  var job = engine.createJob(scene, Math.random);
  var model = blankModel(lang, scene);
  var logs = [];
  var logVersion = 0;
  var paintedLog = -1;
  var paused = false;
  var last = performance.now();
  var copyTimer = 0;
  var thumbs = [];

  var tagline = document.getElementById("tagline");
  var watermark = document.getElementById("watermark");
  var sceneLabel = document.getElementById("scene-label");
  var fullscreenBtn = document.getElementById("fullscreen");
  var hint = document.getElementById("hint");
  var shareX = document.getElementById("share-x");
  var copyBtn = document.getElementById("copy");
  var shareBtn = document.getElementById("share");
  var copyStatus = document.getElementById("copy-status");
  var stage = document.getElementById("stage");
  var tool = document.getElementById("tool");
  var toolName = document.getElementById("tool-name");
  var toolProject = document.getElementById("tool-project");
  var toolPct = document.getElementById("tool-pct");
  var bar = document.getElementById("bar");
  var statusEl = document.getElementById("status");
  var logEl = document.getElementById("log");
  var previewArt = document.getElementById("preview-art");
  var hudFrame = document.getElementById("hud-frame");
  var playhead = null;
  var chart = document.getElementById("loss-chart");

  function blankModel(nextLang, nextScene) {
    return {
      lang: nextLang,
      scene: nextScene,
      headline: "",
      lastSerious: "",
      lastJoke: "",
      recentSerious: [],
      recentJokes: []
    };
  }

  function ui() {
    return copy.UI[lang];
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function stamp(date) {
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function clock(sec) {
    sec = Math.max(0, Math.round(sec));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    if (h > 0) return h + ":" + pad2(m) + ":" + pad2(s);
    return pad2(m) + ":" + pad2(s);
  }

  function padFrame(n, total) {
    var s = String(n);
    var width = String(total).length;
    while (s.length < width) s = "0" + s;
    return s;
  }

  function formatInt(n) {
    var locale = lang === "ja" ? "ja-JP" : lang === "zh" ? "zh-CN" : "en-US";
    return Math.round(n).toLocaleString(locale);
  }

  function text(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function pushLine(value, when) {
    logs.push({ t: stamp(when || new Date()), text: value });
    if (logs.length > 48) logs.shift();
    logVersion += 1;
  }

  function take(event, when) {
    var line = copy.apply(model, event, Math.random, job);
    if (line.log) pushLine(line.log, when);
  }

  function seedLog() {
    logs = [];
    var now = Date.now();
    var i;
    for (i = 8; i >= 1; i--) take("status", new Date(now - i * 2800));
  }

  function xHref(shareText) {
    return "https://x.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(PAGE);
  }

  function applyChrome() {
    var strings = ui();
    document.title = strings.docTitle;
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
    document.documentElement.dataset.lang = lang;
    tagline.textContent = strings.tagline;
    watermark.textContent = strings.watermark;
    sceneLabel.textContent = strings.sceneLabel;
    fullscreenBtn.textContent = strings.fullscreen;
    hint.textContent = strings.hint;
    shareX.textContent = strings.shareX;
    shareX.href = xHref(strings.shareText);
    copyBtn.textContent = strings.copy;
    shareBtn.textContent = strings.share;
    document.getElementById("lang-switch").setAttribute("aria-label", strings.langLabel);
    text("label-elapsed", strings.elapsed);
    text("label-eta", strings.eta);
    text("label-frame", strings.frame);
    text("label-epoch", strings.epoch);
    text("label-loss", strings.loss);
    text("label-step", strings.step);
    text("label-lr", strings.lr);
    text("label-rows", strings.rows);
    text("label-tp", strings.throughput);
    text("label-bytes", strings.transferred);
    text("th-batch", strings.batch);
    text("th-rows", strings.batchRows);
    text("th-state", strings.state);
    text("build-prompt", strings.prompt);

    var langButtons = document.querySelectorAll(".lang");
    var i;
    for (i = 0; i < langButtons.length; i++) {
      var on = langButtons[i].dataset.lang === lang;
      langButtons[i].classList.toggle("is-on", on);
      langButtons[i].setAttribute("aria-pressed", on ? "true" : "false");
    }
    syncSceneButtons();
  }

  function syncSceneButtons() {
    var buttons = document.querySelectorAll("#scenes [data-scene]");
    var i;
    for (i = 0; i < buttons.length; i++) {
      var on = buttons[i].dataset.scene === scene;
      buttons[i].classList.toggle("is-on", on);
      buttons[i].setAttribute("aria-checked", on ? "true" : "false");
      buttons[i].textContent = ui().scenes[buttons[i].dataset.scene];
    }
  }

  function showScene() {
    var panels = document.querySelectorAll("[data-panel]");
    var i;
    for (i = 0; i < panels.length; i++) {
      panels[i].hidden = panels[i].dataset.panel !== scene;
    }
  }

  function renderLog(force) {
    if (!force && paintedLog === logVersion) return;
    paintedLog = logVersion;
    var count = scene === "build" ? 16 : 6;
    var slice = logs.slice(Math.max(0, logs.length - count));
    logEl.replaceChildren();
    var i;
    for (i = 0; i < slice.length; i++) {
      var li = document.createElement("li");
      var time = document.createElement("span");
      var msg = document.createElement("span");
      time.className = "log-time";
      time.textContent = slice[i].t;
      msg.className = "log-msg";
      msg.textContent = slice[i].text;
      li.append(time, msg);
      logEl.appendChild(li);
    }
  }

  function renderBatches(strings) {
    var body = document.getElementById("batch-body");
    body.replaceChildren();
    var i;
    for (i = job.recent.length - 1; i >= 0; i--) {
      var row = job.recent[i];
      var tr = document.createElement("tr");
      if (row.state === "writing") tr.className = "is-hot";
      var cells = [
        formatInt(row.id),
        formatInt(row.rows),
        row.state === "writing" ? strings.writing : strings.done
      ];
      var c;
      for (c = 0; c < cells.length; c++) {
        var td = document.createElement("td");
        td.textContent = cells[c];
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
  }

  function drawChart() {
    if (scene !== "train") return;
    var width = chart.clientWidth;
    var height = chart.clientHeight;
    if (width < 2 || height < 2) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var pw = Math.floor(width * dpr);
    var ph = Math.floor(height * dpr);
    if (chart.width !== pw || chart.height !== ph) {
      chart.width = pw;
      chart.height = ph;
    }
    var ctx = chart.getContext("2d");
    var values = job.lossHist;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    var g;
    for (g = 1; g <= 3; g++) {
      var gy = (height / 4) * g;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
    if (values.length < 2) return;
    var min = values[0];
    var max = values[0];
    var i;
    for (i = 1; i < values.length; i++) {
      if (values[i] < min) min = values[i];
      if (values[i] > max) max = values[i];
    }
    var spread = max - min || 0.05;
    min -= spread * 0.12;
    max += spread * 0.12;
    function xAt(index) {
      return (index / (values.length - 1)) * (width - 8) + 4;
    }
    function yAt(value) {
      return height - 8 - ((value - min) / (max - min)) * (height - 16);
    }
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    for (i = 1; i < values.length; i++) ctx.lineTo(xAt(i), yAt(values[i]));
    ctx.strokeStyle = "#3ddc97";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.lineTo(xAt(values.length - 1), height);
    ctx.lineTo(xAt(0), height);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, "rgba(61, 220, 151, 0.28)");
    grad.addColorStop(1, "rgba(61, 220, 151, 0)");
    ctx.fillStyle = grad;
    ctx.fill();
  }

  function paint(forceLog) {
    var strings = ui();
    var pct = engine.shownPct(job.progress);
    tool.dataset.scene = scene;
    showScene();
    toolName.textContent = strings.toolNames[scene];
    toolProject.textContent = strings.projects[scene];
    toolPct.textContent = pct.toFixed(1) + "%";
    bar.style.width = pct.toFixed(1) + "%";
    statusEl.textContent = model.headline;

    var ratio = job.frame / job.frameTotal;
    previewArt.style.backgroundPosition = (18 + (job.frame % 70)) + "% " + (24 + (job.frame % 45)) + "%";
    hudFrame.textContent = padFrame(job.frame, job.frameTotal) + " / " + padFrame(job.frameTotal, job.frameTotal);
    text("elapsed", clock(job.headStart + job.elapsed));
    text("eta", clock(engine.etaSeconds(job)));
    text("frame-label", formatInt(job.frame) + " / " + formatInt(job.frameTotal));
    if (playhead) playhead.style.left = (ratio * 100) + "%";
    var t;
    for (t = 0; t < thumbs.length; t++) {
      var at = (t + 0.5) / thumbs.length;
      thumbs[t].classList.toggle("is-past", at < ratio);
      thumbs[t].classList.toggle("is-now", Math.abs(at - ratio) < 0.5 / thumbs.length);
    }

    var hist = job.lossHist;
    var arrow = "";
    if (hist.length > 8) arrow = hist[hist.length - 1] <= hist[hist.length - 8] ? " ↓" : " ↑";
    text("epoch", formatInt(job.epoch));
    text("loss", job.loss.toFixed(4) + arrow);
    text("step", formatInt(job.stepCount));
    text("lr", job.lr.toExponential(1));
    var mem = 18.4 + (job.gpu / 100) * 4.4;
    text("gpu-line", "GPU " + Math.round(job.gpu) + "%  ·  " + strings.memory + " " + mem.toFixed(1) + " / 24 GB");
    drawChart();

    text("rows", formatInt(job.rows));
    text("throughput", formatInt(job.throughput) + " " + strings.perSec);
    text("bytes", (job.bytes / 1e9).toFixed(1) + " GB");
    var meter = document.getElementById("meter");
    meter.style.width = Math.max(2, Math.min(100, (job.throughput / 3000) * 100)) + "%";
    renderBatches(strings);

    text("task-line", formatInt(job.tasksDone) + " / " + formatInt(job.tasksTotal) + " " + strings.tasks);
    renderLog(forceLog);
  }

  function setScene(next) {
    if (SCENES.indexOf(next) === -1 || next === scene) return;
    scene = next;
    job = engine.createJob(scene, Math.random);
    model = blankModel(lang, scene);
    seedLog();
    applyChrome();
    paint(true);
  }

  function setLang(next) {
    if (next !== "en" && next !== "ja" && next !== "zh") return;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    model = blankModel(lang, scene);
    seedLog();
    applyChrome();
    paint(true);
  }

  function setProgress(value) {
    job.progress = value;
    engine.refresh(job);
    paint(true);
  }

  function tick() {
    var now = performance.now();
    var dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (!paused && dt > 0) {
      var result = engine.step(job, dt, Math.random);
      var i;
      for (i = 0; i < result.events.length; i++) take(result.events[i]);
    }
    paint(false);
  }

  function goFullscreen() {
    var req = stage.requestFullscreen || stage.webkitRequestFullscreen;
    if (!req) return;
    try {
      var pending = req.call(stage);
      if (pending && typeof pending.catch === "function") pending.catch(function () {});
    } catch (e) {}
    keepAwake();
  }

  function keepAwake() {
    try {
      if (!navigator.wakeLock || document.visibilityState !== "visible") return;
      navigator.wakeLock.request("screen").catch(function () {});
    } catch (e) {}
  }

  function flashCopied() {
    copyStatus.textContent = ui().copied;
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () { copyStatus.textContent = ""; }, 2400);
  }

  function copyLink() {
    var done = flashCopied;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(PAGE).then(done).catch(fallback);
      return;
    }
    fallback();
    function fallback() {
      var area = document.createElement("textarea");
      area.value = PAGE;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); done(); } catch (e) {}
      area.remove();
    }
  }

  function exitFullscreen() {
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (!exit || !document.fullscreenElement) return;
    try {
      var pending = exit.call(document);
      if (pending && typeof pending.catch === "function") pending.catch(function () {});
    } catch (e) {}
  }

  function onKey(event) {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === "Escape") {
      exitFullscreen();
      return;
    }
    var tag = event.target && event.target.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (event.key === "b" || event.key === "B") {
      event.preventDefault();
      var idx = SCENES.indexOf(scene);
      setScene(SCENES[(idx + 1) % SCENES.length]);
    }
  }

  function buildStrip() {
    var strip = document.getElementById("filmstrip");
    var row = document.createElement("div");
    row.className = "film-row";
    var i;
    for (i = 0; i < 16; i++) {
      var thumb = document.createElement("div");
      var hue = (i * 47 + 18) % 360;
      thumb.className = "thumb";
      thumb.style.background =
        "linear-gradient(150deg, hsl(" + hue + " 58% 46%), hsl(" + ((hue + 38) % 360) + " 42% 16%))";
      row.appendChild(thumb);
      thumbs.push(thumb);
    }
    strip.appendChild(row);
    playhead = document.createElement("div");
    playhead.className = "playhead";
    strip.appendChild(playhead);
  }

  buildStrip();
  seedLog();
  applyChrome();
  paint(true);

  fullscreenBtn.addEventListener("click", goFullscreen);
  copyBtn.addEventListener("click", copyLink);
  shareBtn.addEventListener("click", function () {
    var strings = ui();
    if (!navigator.share) return;
    navigator.share({ title: "look-busy", text: strings.shareText, url: PAGE }).catch(function () {});
  });

  var sceneButtons = document.querySelectorAll("#scenes [data-scene]");
  var s;
  for (s = 0; s < sceneButtons.length; s++) {
    sceneButtons[s].addEventListener("click", function (event) {
      setScene(event.currentTarget.dataset.scene);
    });
  }
  var langButtons = document.querySelectorAll(".lang");
  var n;
  for (n = 0; n < langButtons.length; n++) {
    langButtons[n].addEventListener("click", function (event) {
      setLang(event.currentTarget.dataset.lang);
    });
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", keepAwake);
  document.addEventListener("pointerdown", keepAwake, { once: true });
  if (typeof navigator.share === "function") shareBtn.hidden = false;

  window.setInterval(tick, 100);
  keepAwake();

  root.__lookbusy = {
    setLang: setLang,
    setScene: setScene,
    setProgress: setProgress,
    pause: function () { paused = true; },
    resume: function () {
      paused = false;
      last = performance.now();
    },
    getState: function () {
      return {
        progress: job.progress,
        shown: engine.shownPct(job.progress),
        scene: scene,
        lang: lang,
        headline: model.headline,
        logs: logs.map(function (row) { return row.text; }),
        loss: job.loss,
        rows: job.rows
      };
    }
  };
})(window);
