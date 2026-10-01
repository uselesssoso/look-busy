(function (root) {
  // The bar is allowed to sit near the end. It is not allowed to arrive.
  var CAP = 99.15;
  var ROLLBACK_AT = 98.05;

  function derive(job) {
    var frame = Math.round((job.progress / 100) * job.frameTotal);
    job.frame = Math.max(1, Math.min(job.frameTotal - 1, frame));
    var tasks = Math.round((job.progress / 100) * job.tasksTotal);
    job.tasksDone = Math.max(1, Math.min(job.tasksTotal - 1, tasks));
    job.lr = 0.0003 * Math.exp(-job.epoch / 220);
  }

  function pushLoss(job, value) {
    job.lossHist.push(value);
    if (job.lossHist.length > 96) job.lossHist.shift();
  }

  function seedLoss(job, rand) {
    var hist = [];
    var value = 1.15 + rand() * 0.4;
    var i;
    for (i = 0; i < 72; i++) {
      value = value * 0.975 + 0.08 * 0.025 + (rand() - 0.48) * 0.012;
      if (value < 0.05) value = 0.05;
      hist.push(value);
    }
    job.lossHist = hist;
    job.loss = hist[hist.length - 1];
  }

  function seedBatches(job, rand) {
    var recent = [];
    var id = job.batch - 3;
    var i;
    for (i = 0; i < 4; i++) {
      recent.push({
        id: id + i,
        rows: 4096,
        state: i === 3 ? "writing" : "done"
      });
    }
    job.batch = id + 3;
    job.recent = recent;
    job.batchRows = 4096;
    job.batchTick = rand() * 0.6;
  }

  function createJob(scene, rand) {
    var r = rand || Math.random;
    var progress = 24 + r() * 32;
    var job = {
      scene: scene,
      progress: progress,
      phaseLeft: 0,
      stallLeft: 0,
      speedMul: 1,
      sinceRollback: 100,
      emaRate: 0.42,
      logWait: 2.4,
      elapsed: 0,
      headStart: 480 + r() * 2400,
      frameTotal: 2880,
      frame: 1,
      epoch: 36 + Math.floor(r() * 90),
      epochFrac: r(),
      stepCount: 18000 + Math.floor(r() * 70000),
      loss: 0.4,
      lossHist: [],
      lossTick: 0,
      gpu: 88,
      rows: 600000 + Math.floor(r() * 1800000),
      bytes: 8e9 + r() * 22e9,
      throughput: 1400,
      batch: 240 + Math.floor(r() * 180),
      batchRows: 4096,
      batchTick: 0,
      recent: [],
      tasksTotal: 160 + Math.floor(r() * 80),
      tasksDone: 1,
      lr: 3e-4
    };
    seedLoss(job, r);
    seedBatches(job, r);
    derive(job);
    return job;
  }

  function nextPhase(job, rand) {
    var roll = rand();
    if (roll < 0.16) {
      job.stallLeft = 0.45 + rand() * 2.15;
      job.speedMul = 0;
      job.phaseLeft = job.stallLeft;
      return;
    }
    job.stallLeft = 0;
    if (roll < 0.4) {
      job.speedMul = 0.2 + rand() * 0.32;
      job.phaseLeft = 0.7 + rand() * 2.1;
    } else if (roll < 0.84) {
      job.speedMul = 0.72 + rand() * 0.7;
      job.phaseLeft = 0.55 + rand() * 1.9;
    } else {
      job.speedMul = 1.5 + rand() * 1.25;
      job.phaseLeft = 0.3 + rand() * 0.85;
    }
  }

  function advance(job, dt, stalled, rand) {
    if (job.scene === "train") {
      if (!stalled) {
        job.stepCount += Math.max(1, Math.round((10 + rand() * 24) * dt));
        job.epochFrac += dt * (0.035 + rand() * 0.02);
        if (job.epochFrac >= 1) {
          job.epoch += 1;
          job.epochFrac -= 1;
        }
        var target = 0.058 + 1.35 * Math.exp(-job.epoch / 52);
        job.loss = job.loss * 0.9 + target * 0.1 + (rand() - 0.5) * 0.003;
        if (rand() < dt * 0.12) job.loss += 0.008 + rand() * 0.02;
        if (job.loss < 0.04) job.loss = 0.04;
      }
      job.lossTick += dt;
      if (job.lossTick >= 0.38) {
        job.lossTick = 0;
        pushLoss(job, job.loss);
      }
      var gpuTarget = stalled ? 14 + rand() * 24 : 80 + rand() * 18;
      job.gpu = job.gpu * 0.88 + gpuTarget * 0.12;
    } else if (job.scene === "export") {
      var tp = stalled ? rand() * 28 : 650 + rand() * 2200;
      job.throughput = job.throughput * 0.72 + tp * 0.28;
      job.rows += job.throughput * dt;
      job.bytes += job.throughput * dt * 520;
      if (!stalled) {
        job.batchTick += dt;
        if (job.batchTick >= 1.65) {
          job.batchTick = 0;
          job.batch += 1;
          if (job.recent.length && job.recent[job.recent.length - 1].state === "writing") {
            job.recent[job.recent.length - 1].state = "done";
          }
          job.batchRows = [2048, 4096, 4096, 8192][Math.floor(rand() * 4)];
          job.recent.push({ id: job.batch, rows: job.batchRows, state: "writing" });
          if (job.recent.length > 4) job.recent.shift();
        }
      }
    } else {
      var idle = stalled ? 20 + rand() * 30 : 84 + rand() * 14;
      job.gpu = job.gpu * 0.9 + idle * 0.1;
    }
  }

  function step(job, dt, rand) {
    var r = rand || Math.random;
    dt = Math.max(0, Math.min(0.25, dt));
    var events = [];
    job.elapsed += dt;
    job.sinceRollback += dt;

    if (job.phaseLeft <= 0) nextPhase(job, r);
    else job.phaseLeft -= dt;

    if (job.stallLeft > 0) job.stallLeft = Math.max(0, job.stallLeft - dt);
    var stalled = job.stallLeft > 0;
    var delta = 0;

    if (!stalled) {
      var headroom = Math.max(0.35, CAP - job.progress);
      var base = 0.18 * Math.pow(headroom / 28, 1.15);
      delta = base * job.speedMul * dt;
      job.progress = Math.min(CAP, job.progress + delta);
    }

    var inst = dt > 0 ? delta / dt : 0;
    job.emaRate = job.emaRate * 0.94 + inst * 0.06;

    var rolled = false;
    if (job.progress >= ROLLBACK_AT && job.sinceRollback > 24 && r() < dt * 0.03) {
      job.progress = 89 + r() * 6.4;
      job.sinceRollback = 0;
      job.emaRate = 0.36;
      rolled = true;
      events.push("rollback");
      if (job.scene === "train") {
        job.loss = Math.min(1.6, job.loss + 0.045 + r() * 0.07);
        pushLoss(job, job.loss);
      }
    }

    job.logWait -= dt;
    if (job.logWait <= 0) {
      job.logWait = 0.85 + r() * 1.55;
      if (!rolled) events.push(r() < 1 / 15 ? "joke" : "status");
    }

    advance(job, dt, stalled, r);
    derive(job);
    return { events: events, stalled: stalled };
  }

  function etaSeconds(job) {
    var remain = Math.max(0.25, CAP - job.progress);
    var rate = Math.max(0.018, job.emaRate);
    var eta = remain / rate;
    if (job.progress > 90) eta *= 1 + (job.progress - 90) * 0.25;
    if (job.stallLeft > 0) eta += 14;
    if (eta < 15) eta = 15;
    if (eta > 4 * 3600) eta = 4 * 3600;
    return eta;
  }

  function shownPct(progress) {
    var rounded = Math.round(Math.max(0, progress) * 10) / 10;
    if (rounded > 99.1) rounded = 99.1;
    return rounded;
  }

  root.LookBusyEngine = {
    CAP: CAP,
    ROLLBACK_AT: ROLLBACK_AT,
    createJob: createJob,
    step: step,
    etaSeconds: etaSeconds,
    shownPct: shownPct,
    refresh: derive
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
