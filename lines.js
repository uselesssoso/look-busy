(function (root) {
  var FILES = [
    "src/pipeline/resolve.ts",
    "src/pipeline/motion.ts",
    "src/pipeline/color.ts",
    "src/export/encode.ts",
    "src/export/proxy.ts",
    "src/train/loop.ts",
    "src/train/ckpt.ts",
    "src/sync/batch.ts",
    "src/sync/retry.ts",
    "lib/schedule/queue.ts",
    "lib/gpu/submit.ts",
    "lib/image/mask.ts",
    "app/main.ts",
    "app/timeline.ts"
  ];

  var UI = {
    en: {
      docTitle: "look-busy — Looks like you're working. You're not.",
      tagline: "Looks like you're working. You're not.",
      sceneLabel: "Scene",
      scenes: {
        video: "Video render",
        train: "Training",
        export: "Export",
        build: "Build"
      },
      fullscreen: "Go full screen",
      hint: "Press B to switch scenes. Esc leaves full screen.",
      shareX: "Share on X",
      copy: "Copy link",
      copied: "Link copied",
      share: "Share",
      shareText: "Looks like you're working. You're not.",
      toolNames: { video: "RENDER", train: "TRAIN", export: "SYNC", build: "BUILD" },
      projects: {
        video: "cut_v3.mov",
        train: "run 4f2c",
        export: "archive sync",
        build: "main #4812"
      },
      elapsed: "Elapsed",
      eta: "ETA",
      frame: "frame",
      epoch: "epoch",
      loss: "loss",
      step: "step",
      lr: "lr",
      memory: "memory",
      rows: "rows",
      throughput: "throughput",
      transferred: "transferred",
      perSec: "rows/s",
      batch: "batch",
      batchRows: "rows",
      state: "state",
      writing: "writing",
      done: "done",
      tasks: "tasks",
      prompt: "$ build  main #4812",
      watermark: "BUSY",
      langLabel: "Language"
    },
    ja: {
      docTitle: "look-busy — 仕事してるように見えます。してません。",
      tagline: "仕事してるように見えます。してません。",
      sceneLabel: "シーン",
      scenes: {
        video: "映像の書き出し",
        train: "モデルの学習",
        export: "データの同期",
        build: "ビルド"
      },
      fullscreen: "全画面にする",
      hint: "B でシーンを切り替え。Esc で全画面を終了。",
      shareX: "X で共有",
      copy: "リンクをコピー",
      copied: "コピーしました",
      share: "共有",
      shareText: "仕事してるように見えます。してません。",
      toolNames: { video: "書き出し", train: "学習", export: "同期", build: "ビルド" },
      projects: {
        video: "cut_v3.mov",
        train: "run 4f2c",
        export: "アーカイブへ同期",
        build: "main #4812"
      },
      elapsed: "経過",
      eta: "残り",
      frame: "コマ",
      epoch: "回数",
      loss: "損失",
      step: "更新",
      lr: "学習率",
      memory: "メモリ",
      rows: "件数",
      throughput: "速度",
      transferred: "転送量",
      perSec: "件/秒",
      batch: "番号",
      batchRows: "件数",
      state: "状態",
      writing: "書込中",
      done: "完了",
      tasks: "件",
      prompt: "$ ビルド  main #4812",
      watermark: "仕事中",
      langLabel: "言語"
    },
    zh: {
      docTitle: "look-busy — 看着挺忙。其实没有。",
      tagline: "看着挺忙。其实没有。",
      sceneLabel: "场景",
      scenes: {
        video: "视频渲染",
        train: "模型训练",
        export: "数据同步",
        build: "编译构建"
      },
      fullscreen: "全屏",
      hint: "按 B 换场景。按 Esc 退出全屏。",
      shareX: "分享到 X",
      copy: "复制链接",
      copied: "链接已复制",
      share: "分享",
      shareText: "看着挺忙。其实没有。",
      toolNames: { video: "渲染", train: "训练", export: "同步", build: "构建" },
      projects: {
        video: "cut_v3.mov",
        train: "run 4f2c",
        export: "同步到归档",
        build: "main #4812"
      },
      elapsed: "已用时",
      eta: "剩余",
      frame: "帧",
      epoch: "轮次",
      loss: "损失",
      step: "步数",
      lr: "学习率",
      memory: "显存",
      rows: "行数",
      throughput: "速度",
      transferred: "已传输",
      perSec: "行/秒",
      batch: "批次",
      batchRows: "行数",
      state: "状态",
      writing: "写入中",
      done: "完成",
      tasks: "项",
      prompt: "$ 构建  main #4812",
      watermark: "忙碌",
      langLabel: "语言"
    }
  };

  var LINES = {
    en: {
      video: {
        rollback: "Re-optimizing keyframes…",
        serious: [
          "Rendering frame {frame}",
          "Denoising frame {frame}, pass {pass}/4",
          "Sampling motion for frame {frame}",
          "Writing the preview proxy",
          "Matching color on this shot",
          "Stabilizing the camera path",
          "Baking ambient light",
          "Flushing the frame buffer",
          "Refining the edge mask",
          "Encoding tile {pass} of 8",
          "Estimating frames still ahead",
          "Laying down the grain",
          "Waiting on the GPU queue",
          "Caching optical flow",
          "Checking the color range",
          "Outputting 4K"
        ],
        jokes: [
          "Pretending to align stakeholders…",
          "Estimated time remaining: until your manager leaves",
          "Rendering the appearance of progress…",
          "This frame is for people walking past",
          "Saving the vibe"
        ]
      },
      train: {
        rollback: "Reloading the last good checkpoint…",
        serious: [
          "Training step {step}",
          "Validating the latest checkpoint",
          "Computing loss for epoch {epoch}",
          "Shuffling the next batch",
          "Updating weights",
          "Clipping gradients",
          "Writing checkpoint {epoch}",
          "Evaluating a held-out slice",
          "Warming the data loader",
          "Syncing gradients",
          "Decaying the learning rate",
          "Checking for NaNs",
          "Saving optimizer state",
          "Reading the next shard",
          "Measuring validation loss",
          "Pinning memory for this batch"
        ],
        jokes: [
          "Loss is down. So is everyone.",
          "Pretending to align stakeholders…",
          "Estimated time remaining: until your manager leaves",
          "The model is learning. You already know.",
          "Metrics improved. The afternoon did not."
        ]
      },
      export: {
        rollback: "Retrying a stalled batch…",
        serious: [
          "Writing batch {batch}",
          "Flushing {rows} rows",
          "Checking checksums",
          "Opening the next partition",
          "Compressing a column group",
          "Streaming rows out",
          "Updating the catalog",
          "Verifying row counts",
          "Waiting on a table lock",
          "Splitting a wide table",
          "Indexing the new partition",
          "Reading the next cursor",
          "Throttling to stay under the cap",
          "Committing progress",
          "Scanning for gaps",
          "Closing batch {batch}"
        ],
        jokes: [
          "Rows are moving. You can stay put.",
          "Estimated time remaining: until your manager leaves",
          "Syncing, mostly with the room",
          "Throughput looks better if you lean in",
          "Pretending to align stakeholders…"
        ]
      },
      build: {
        rollback: "Rebuilding a stale target…",
        serious: [
          "Compiling {file}",
          "Typecheck clean for {file}",
          "Linking the export worker",
          "Bundling the preview runtime",
          "Hashing static assets",
          "Checking stale outputs",
          "Writing the source map",
          "Optimizing chunk {pass} of 11",
          "Resolving imports in {file}",
          "Cache hit · {file}",
          "Emitting the manifest",
          "Minifying the scheduler",
          "Warming the compile cache",
          "Verifying types in {file}",
          "Reading the lockfile",
          "Queuing task {done} of {tasks}"
        ],
        jokes: [
          "Compiling a busy atmosphere…",
          "Warning: output is mostly ambience",
          "Estimated time remaining: until your manager leaves",
          "Pretending to align stakeholders…",
          "Scheduled to finish once the hallway is empty"
        ]
      }
    },
    ja: {
      video: {
        rollback: "重要なコマをやり直しています…",
        serious: [
          "{frame} コマ目を書き出しています…",
          "{frame} コマ目のノイズを取っています（{pass} / 4）…",
          "{frame} コマ目の動きを計算しています…",
          "プレビューを書き込んでいます…",
          "このカットの色を合わせています…",
          "カメラの揺れを抑えています…",
          "環境光を焼き込んでいます…",
          "一時領域を空にしています…",
          "輪郭を切り抜いています…",
          "区画 {pass} / 8 を符号化しています…",
          "残りのコマ数を見積もっています…",
          "粒子を重ねています…",
          "描画の順番を待っています…",
          "動きの情報を保存しています…",
          "色の範囲を確認しています…",
          "4K で出力しています…"
        ],
        jokes: [
          "関係者の都合を待っています。都合は来ません",
          "残り時間：上司が席を外すまで",
          "忙しそうな画面を書き出しています",
          "このコマは、通りがかりの人向けです",
          "振り返りました。結論は、もう少し待つことです"
        ]
      },
      train: {
        rollback: "うまくいっていた時点に戻しています…",
        serious: [
          "{step} 回目の更新をしています…",
          "直前の状態を検証しています…",
          "{epoch} 回目の損失を計算しています…",
          "次のデータを混ぜています…",
          "重みを更新しています…",
          "勾配が大きくなりすぎないよう抑えています…",
          "{epoch} 回目の状態を保存しています…",
          "残しておいたデータで確かめています…",
          "データの読み込みを温めています…",
          "勾配を揃えています…",
          "学習率を下げています…",
          "数値が壊れていないか見ています…",
          "最適化の状態を保存しています…",
          "次の分割データを読んでいます…",
          "検証用の損失を測っています…",
          "この回に使うメモリを確保しています…"
        ],
        jokes: [
          "損失は下がっています。やる気は測っていません",
          "モデルは勉強中です。人はもう休みです",
          "残り時間：上司が席を外すまで",
          "数字は良くなりました。午後は別です",
          "認識合わせの相手が、まだ席にいません"
        ]
      },
      export: {
        rollback: "止まった分を送り直しています…",
        serious: [
          "{batch} 番を書き込んでいます…",
          "{rows} 件を送り出しています…",
          "照合値を確認しています…",
          "次の区画を開いています…",
          "列のまとまりを圧縮しています…",
          "行を流しています…",
          "一覧を更新しています…",
          "件数を突き合わせています…",
          "表のロックが外れるのを待っています…",
          "幅の広い表を分けています…",
          "新しい区画に索引を付けています…",
          "次の位置を読んでいます…",
          "上限を超えないよう抑えています…",
          "ここまでの分を確定しています…",
          "抜けがないか調べています…",
          "{batch} 番を閉じています…"
        ],
        jokes: [
          "行は進んでいます。人は座ったままで大丈夫です",
          "同期しているのは、主に部屋の空気です",
          "残り時間：上司が席を外すまで",
          "画面に近づくと、速く見えます",
          "項目を揃えています。項目の方が会議中です"
        ]
      },
      build: {
        rollback: "古くなった部分を作り直しています…",
        serious: [
          "{file} をコンパイルしています",
          "{file} の型は問題ありません",
          "出力先をつないでいます",
          "プレビューをひとつにまとめています",
          "ファイルの照合値を計算しています",
          "古い生成物が残っていないか見ています",
          "ソースマップを書いています",
          "{pass} / 11 個目を最適化しています",
          "{file} の依存関係を解決しています",
          "キャッシュにありました · {file}",
          "一覧を出力しています",
          "スケジューラを縮めています",
          "コンパイル用のキャッシュを温めています",
          "{file} の型を確認しています",
          "ロックファイルを読んでいます",
          "{done} / {tasks} 件を処理しています"
        ],
        jokes: [
          "忙しそうな雰囲気を作っています",
          "警告：成果はほぼ雰囲気です",
          "残り時間：上司が席を外すまで",
          "終わりは、廊下に人がいなくなってからです",
          "視線だけ、きちんと揃えています"
        ]
      }
    },
    zh: {
      video: {
        rollback: "正在重新优化关键帧…",
        serious: [
          "正在渲染第 {frame} 帧",
          "正在给第 {frame} 帧降噪，第 {pass} 遍，共 4 遍",
          "正在计算第 {frame} 帧的运动",
          "正在写入预览文件",
          "正在匹配这个镜头的颜色",
          "正在稳住镜头",
          "正在处理环境光",
          "正在清空帧缓存",
          "正在修边缘",
          "正在编码第 {pass} 块，共 8 块",
          "正在估算还剩多少帧",
          "正在加颗粒",
          "正在排队等显卡",
          "正在缓存光流",
          "正在检查色彩范围",
          "正在输出 4K"
        ],
        jokes: [
          "正在对齐需求，需求说再等一下",
          "剩余时间：领导离开为止",
          "渲染的是一种很忙的气氛",
          "这一帧是给路过的人看的",
          "复盘中，结论是再等等"
        ]
      },
      train: {
        rollback: "正在退回上次正常的进度…",
        serious: [
          "正在进行第 {step} 步更新",
          "正在验证最新进度",
          "正在计算第 {epoch} 轮的损失",
          "正在打乱下一批数据",
          "正在更新权重",
          "正在裁剪梯度",
          "正在保存第 {epoch} 轮",
          "正在用留出的数据验证",
          "正在预热数据读取",
          "正在同步梯度",
          "正在降低学习率",
          "正在检查数值是否异常",
          "正在保存优化器状态",
          "正在读取下一段数据",
          "正在测量验证损失",
          "正在为这批数据准备内存"
        ],
        jokes: [
          "损失在降，精神也在降",
          "模型还在学，人已经会摸鱼了",
          "剩余时间：领导离开为止",
          "指标挺好看，下午不太好看",
          "正在对齐，对方还在忙"
        ]
      },
      export: {
        rollback: "卡住的那批正在重试…",
        serious: [
          "正在写入第 {batch} 批",
          "正在送出 {rows} 行",
          "正在核对校验",
          "正在打开下一个分区",
          "正在压缩一组列",
          "正在把行传出去",
          "正在更新目录",
          "正在核对行数",
          "正在等表锁",
          "正在拆分宽表",
          "正在给新分区建索引",
          "正在读取下一个位置",
          "正在限速，避免打满",
          "正在提交当前进度",
          "正在检查有没有缺口",
          "正在关闭第 {batch} 批"
        ],
        jokes: [
          "行在走，人可以坐着",
          "同步的主要是办公室的空气",
          "剩余时间：领导离开为止",
          "往前凑一点，看着更快",
          "正在对齐字段，字段先去开会了"
        ]
      },
      build: {
        rollback: "正在重做过期的部分…",
        serious: [
          "正在编译 {file}",
          "{file} 类型检查已通过",
          "正在链接导出模块",
          "正在打包预览",
          "正在计算静态资源的校验值",
          "正在检查过期产物",
          "正在写入源映射",
          "正在优化第 {pass} 块，共 11 块",
          "正在解析 {file} 的依赖",
          "命中缓存 · {file}",
          "正在生成清单",
          "正在压缩调度模块",
          "正在预热编译缓存",
          "正在核对 {file} 的类型",
          "正在读取锁文件",
          "正在处理 {done} / {tasks} 项"
        ],
        jokes: [
          "正在编译一种忙碌感",
          "警告：产出主要是气氛",
          "剩余时间：领导离开为止",
          "构建排在走廊没人之后",
          "正在对齐，对齐的是路过的视线"
        ]
      }
    }
  };

  function group(n) {
    var s = String(Math.round(n));
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

function pick(list, rand, recent) {
  if (!list.length) return "";
  var pool = [];
  var i;
  for (i = 0; i < list.length; i++) {
    if (!recent || recent.indexOf(list[i]) === -1) pool.push(list[i]);
  }
  if (!pool.length) pool = list;
  return pool[Math.floor(rand() * pool.length)];
}

function remember(recent, item) {
  recent.push(item);
  if (recent.length > 6) recent.shift();
}

  function fill(template, job, rand) {
    var file = FILES[Math.floor(rand() * FILES.length)];
    var frame = String(job.frame);
    var width = String(job.frameTotal).length;
    while (frame.length < width) frame = "0" + frame;
    return template
      .replaceAll("{frame}", frame)
      .replaceAll("{pass}", String((job.frame % 4) + 1))
      .replaceAll("{batch}", group(job.batch))
      .replaceAll("{epoch}", String(job.epoch))
      .replaceAll("{file}", file)
      .replaceAll("{done}", group(job.tasksDone))
      .replaceAll("{tasks}", group(job.tasksTotal))
      .replaceAll("{step}", group(job.stepCount))
      .replaceAll("{rows}", group(job.batchRows));
  }

function apply(model, event, rand, job) {
  var pack = LINES[model.lang][model.scene];
  if (!model.recentSerious) model.recentSerious = [];
  if (!model.recentJokes) model.recentJokes = [];
  if (event === "rollback") {
    model.headline = pack.rollback;
    model.lastSerious = pack.rollback;
    return { headline: pack.rollback, log: pack.rollback, joke: false };
  }
  if (event === "joke") {
    var jokeTemplate = pick(pack.jokes, rand, model.recentJokes);
    remember(model.recentJokes, jokeTemplate);
    var joke = fill(jokeTemplate, job, rand);
    model.lastJoke = joke;
    return { headline: model.headline, log: joke, joke: true };
  }
  var template = pick(pack.serious, rand, model.recentSerious);
  remember(model.recentSerious, template);
  var line = fill(template, job, rand);
  model.lastSerious = line;
  model.headline = line;
  return { headline: line, log: line, joke: false };
}

  root.LookBusyCopy = { UI: UI, LINES: LINES, apply: apply, fill: fill };
})(typeof globalThis !== "undefined" ? globalThis : this);
