(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const progressFill = document.getElementById("progressFill");
  const slideNum = document.getElementById("slideNum");
  const slideTotal = document.getElementById("slideTotal");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const soundBtn = document.getElementById("soundBtn");
  const confettiLayer = document.getElementById("confetti");

  const faresVoice = document.getElementById("faresVoice");
  const playVoiceBtn = document.getElementById("playVoice");
  const finalePhoto = document.querySelector(".finale-photo");
  const faresVoiceBox = document.getElementById("faresVoiceBox");
  let voiceTimer = null;

  let index = 0;
  let soundOn = true;
  let stars = 0;
  let audioCtx = null;

  slideTotal.textContent = String(slides.length);

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, duration = 0.15, type = "sine", gain = 0.08) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  function playSuccess() {
    tone(523, 0.12, "triangle", 0.09);
    setTimeout(() => tone(659, 0.12, "triangle", 0.09), 90);
    setTimeout(() => tone(784, 0.2, "triangle", 0.1), 180);
  }

  function playPop() {
    tone(880, 0.08, "square", 0.04);
  }

  function playWhoosh() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.35);
    g.gain.value = 0.05;
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.35);
  }

  function playWrong() {
    tone(180, 0.2, "sawtooth", 0.06);
  }

  function playClick() {
    tone(420, 0.05, "triangle", 0.04);
  }

  const spideyPop = document.getElementById("spideyPop");
  const spideyPopText = document.getElementById("spideyPopText");
  let spideyTimer = null;
  const spideyLines = [
    "يا أبطال! 🕸️",
    "ممتاز يا أصدقاء!",
    "واصلوا يا شطار!",
    "أنتم نجوم! ⭐",
    "يلا نكمل مع بعض!",
    "شاطرين جدًا!",
    "واو! أحسنتم!",
    "هيا يا أصدقاء!",
  ];
  let spideyLineIndex = 0;

  function showSpidey(message) {
    if (!spideyPop) return;
    const text = message || spideyLines[spideyLineIndex % spideyLines.length];
    spideyLineIndex += 1;
    spideyPopText.textContent = text;
    spideyPop.hidden = false;
    requestAnimationFrame(() => spideyPop.classList.add("show"));
    playPop();
    clearTimeout(spideyTimer);
    spideyTimer = setTimeout(() => {
      spideyPop.classList.remove("show");
      setTimeout(() => {
        spideyPop.hidden = true;
      }, 220);
    }, 2000);
  }

  // كل كبسة زر مهمة → ظهور سبايدر مان ثانيتين
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.id === "soundBtn" || btn.id === "playVoice") return;
    if (btn.closest("#spideyPop")) return;
    // أزرار التنقل تظهر أحيانًا فقط برسالة خفيفة
    if (btn.id === "prevBtn" || btn.id === "nextBtn") {
      if (Math.random() > 0.45) showSpidey();
      return;
    }
    showSpidey();
  });

  function burstConfetti(count = 40) {
    const colors = ["#f472b6", "#60a5fa", "#facc15", "#34d399", "#a78bfa", "#fb7185"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      confettiLayer.appendChild(piece);
      setTimeout(() => piece.remove(), 2400);
    }
  }

  function addStar(n = 1) {
    stars += n;
    const el = document.getElementById("starScore");
    if (el) el.textContent = String(stars);
  }

  // ===== صوت فارس في الشريحة الأخيرة =====
  function setSpeaking(on) {
    finalePhoto?.classList.toggle("speaking", on);
    faresVoiceBox?.classList.toggle("speaking", on);
    if (playVoiceBtn) {
      playVoiceBtn.textContent = on ? "🎙️ فارس يتكلم…" : "🔁 اسمع رسالة فارس مرة ثانية";
    }
  }

  function playFaresVoice() {
    if (!faresVoice) return;
    faresVoice.pause();
    faresVoice.currentTime = 0;
    faresVoice.volume = 1; // أعلى مستوى
    const p = faresVoice.play();
    if (p && p.catch) p.catch(() => setSpeaking(false)); // لو المتصفح منع التشغيل التلقائي يبقى الزر متاح
  }

  function stopFaresVoice() {
    clearTimeout(voiceTimer);
    if (!faresVoice) return;
    faresVoice.pause();
    faresVoice.currentTime = 0;
    setSpeaking(false);
    if (playVoiceBtn) playVoiceBtn.textContent = "🎙️ اسمع رسالة فارس";
  }

  faresVoice?.addEventListener("playing", () => setSpeaking(true));
  faresVoice?.addEventListener("pause", () => setSpeaking(false));
  faresVoice?.addEventListener("ended", () => setSpeaking(false));

  playVoiceBtn?.addEventListener("click", () => {
    if (!soundOn) {
      soundOn = true;
      soundBtn.textContent = "🔊";
    }
    playFaresVoice();
  });

  function goTo(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    if (index !== slides.length - 1) stopFaresVoice();
    slides.forEach((s, n) => s.classList.toggle("active", n === index));
    slideNum.textContent = String(index + 1);
    progressFill.style.width = `${((index + 1) / slides.length) * 100}%`;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === slides.length - 1;
    playClick();
    onSlideEnter(slides[index]);
    if (index === slides.length - 1) {
      burstConfetti(60);
      playSuccess();
      // صوت فارس يبدأ تلقائيًا بعد نغمة الاحتفال بثانية تقريبًا
      clearTimeout(voiceTimer);
      voiceTimer = setTimeout(() => {
        if (soundOn && index === slides.length - 1) playFaresVoice();
      }, 1000);
    }
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => goTo(index + 1));
  });

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊" : "🔇";
    if (!soundOn) stopFaresVoice();
    if (soundOn) {
      ensureAudio();
      playPop();
    }
  });

  document.getElementById("replayAll")?.addEventListener("click", () => {
    stars = 0;
    document.getElementById("starScore").textContent = "0";
    goTo(0);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index + 1);
    if (e.key === "ArrowRight") goTo(index - 1);
  });

  /* ---- Block builders ---- */
  const CUBE_COLORS = [
    "#ef4444", "#f97316", "#eab308", "#84cc16",
    "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
    "#8b5cf6", "#ec4899",
  ];

  function fillTenSegments(container, unitClass) {
    for (let i = 0; i < 10; i++) {
      const unit = document.createElement("div");
      unit.className = unitClass;
      unit.style.background = `linear-gradient(145deg, ${CUBE_COLORS[i]}ee, ${CUBE_COLORS[i]})`;
      container.appendChild(unit);
    }
  }

  function makeTenRod(extraClass = "") {
    const el = document.createElement("div");
    el.className = `ten-rod-visual ${extraClass}`.trim();
    fillTenSegments(el, "ten-unit");
    const badge = document.createElement("div");
    badge.className = "ten-badge";
    badge.textContent = "10";
    el.appendChild(badge);
    return el;
  }

  function makeOneCube() {
    const el = document.createElement("div");
    el.className = "one-cube-visual";
    el.style.background = `linear-gradient(145deg, #93c5fd, ${CUBE_COLORS[Math.floor(Math.random() * CUBE_COLORS.length)]})`;
    return el;
  }

  function renderBlocks(container, tens, ones) {
    if (!container) return;
    container.innerHTML = "";
    const tg = document.createElement("div");
    tg.className = "tens-group";
    const og = document.createElement("div");
    og.className = "ones-group";
    for (let i = 0; i < tens; i++) tg.appendChild(makeTenRod("building"));
    for (let i = 0; i < ones; i++) og.appendChild(makeOneCube());
    container.appendChild(tg);
    container.appendChild(og);
  }

  function renderMiniBlocks(el) {
    const raw = el.getAttribute("data-blocks") || "0,0";
    const [t, o] = raw.split(",").map((n) => parseInt(n, 10) || 0);
    el.innerHTML = "";
    for (let i = 0; i < t; i++) {
      const rod = document.createElement("div");
      rod.className = "mini-ten";
      fillTenSegments(rod, "mini-ten-unit");
      el.appendChild(rod);
    }
    for (let i = 0; i < o; i++) {
      const cube = document.createElement("div");
      cube.className = "mini-one";
      el.appendChild(cube);
    }
  }

  function renderAbacus(el) {
    const raw = el.getAttribute("data-abacus") || "0,0";
    const [t, o] = raw.split(",").map((n) => parseInt(n, 10) || 0);
    el.innerHTML = "";
    el.classList.add("abacus-panel");

    const frame = document.createElement("div");
    frame.className = "abacus-frame";

    [
      { count: t, kind: "tens" },
      { count: o, kind: "ones" },
    ].forEach(({ count, kind }) => {
      const col = document.createElement("div");
      col.className = `abacus-col abacus-${kind}`;

      const rod = document.createElement("div");
      rod.className = "abacus-rod";

      for (let i = 0; i < count; i++) {
        const bead = document.createElement("div");
        bead.className = `bead bead-${kind}`;
        rod.appendChild(bead);
      }

      const base = document.createElement("div");
      base.className = "abacus-base";

      col.appendChild(rod);
      col.appendChild(base);
      frame.appendChild(col);
    });

    el.appendChild(frame);
  }

  document.querySelectorAll(".mini-blocks").forEach(renderMiniBlocks);
  document.querySelectorAll(".abacus").forEach(renderAbacus);
  document.querySelectorAll("[data-auto-blocks]").forEach((el) => {
    const [t, o] = el.getAttribute("data-auto-blocks").split(",").map(Number);
    renderBlocks(el, t, o);
  });

  /* ---- Explore 36 with stacking wow ---- */
  async function animateExplore36() {
    const scene = document.getElementById("explore36");
    if (!scene) return;
    scene.innerHTML = "";
    playWhoosh();
    await animateStackingRods(scene, 3, true);
    const ones = document.createElement("div");
    ones.className = "ones-group";
    scene.appendChild(ones);
    for (let i = 0; i < 6; i++) {
      await wait(55);
      ones.appendChild(makeOneCube());
      playPop();
    }
  }

  document.getElementById("replay36")?.addEventListener("click", animateExplore36);

  /* ---- Wow stacking for tens ---- */
  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function animateStackingRods(parent, count, appendGroup = false) {
    let group = parent.querySelector(":scope > .tens-group");
    if (!group) {
      group = document.createElement("div");
      group.className = "tens-group";
      if (appendGroup || true) parent.appendChild(group);
    }

    for (let r = 0; r < count; r++) {
      await animateOneTenFormation(group);
      const live = document.getElementById("liveTens");
      if (live) live.textContent = String(r + 1);
    }
    return group;
  }

  async function animateOneTenFormation(group) {
    const stack = document.createElement("div");
    stack.className = "building-ten-stack";
    group.appendChild(stack);

    // مكعب تلو الآخر بسرعة كبيرة من تحت لفوق
    for (let i = 0; i < 10; i++) {
      const cube = document.createElement("div");
      cube.className = "stack-cube";
      cube.style.background = `linear-gradient(145deg, ${CUBE_COLORS[i]}dd, ${CUBE_COLORS[i]})`;
      stack.appendChild(cube);
      playPop();
      await wait(42);
    }

    const badge = document.createElement("div");
    badge.className = "ten-badge";
    badge.textContent = "عشرة! 10";
    stack.appendChild(badge);
    stack.classList.add("sealed");
    playSuccess();
    await wait(320);

    // يتحول لعمود عشرة ثابت
    const rod = makeTenRod("building");
    group.replaceChild(rod, stack);
    await wait(120);
  }

  document.getElementById("build73")?.addEventListener("click", async () => {
    const arena = document.getElementById("stackArena");
    arena.innerHTML = "";
    document.getElementById("liveTens").textContent = "0";
    document.getElementById("liveOnes").textContent = "0";
    const btn = document.getElementById("build73");
    btn.disabled = true;
    await animateStackingRods(arena, 7);
    const ones = document.createElement("div");
    ones.className = "ones-group";
    arena.appendChild(ones);
    for (let i = 0; i < 3; i++) {
      await wait(70);
      ones.appendChild(makeOneCube());
      document.getElementById("liveOnes").textContent = String(i + 1);
      playPop();
    }
    burstConfetti(30);
    addStar(2);
    btn.disabled = false;
  });

  /* ---- Show 49 ---- */
  document.getElementById("show49")?.addEventListener("click", async () => {
    const box = document.getElementById("answer49");
    box.classList.add("show");
    const scene = document.getElementById("scene49");
    scene.innerHTML = "";
    await animateStackingRods(scene, 4, true);
    const ones = document.createElement("div");
    ones.className = "ones-group";
    scene.appendChild(ones);
    for (let i = 0; i < 9; i++) {
      await wait(45);
      ones.appendChild(makeOneCube());
      playPop();
    }
    playSuccess();
    burstConfetti(20);
    addStar(1);
  });

  /* ---- Type checks ---- */
  document.querySelectorAll(".check-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".exercise-panel");
      const tensIn = panel.querySelector("[data-check-tens]");
      const onesIn = panel.querySelector("[data-check-ones]");
      const feedback = panel.querySelector(".feedback");
      const ok =
        Number(tensIn.value) === Number(tensIn.dataset.checkTens) &&
        Number(onesIn.value) === Number(onesIn.dataset.checkOnes);
      if (ok) {
        feedback.textContent = "ممتاز يا أبطال! 🌟";
        feedback.className = "feedback ok";
        playSuccess();
        burstConfetti(25);
        addStar(1);
      } else {
        feedback.textContent = "حاول مرة أخرى… فكّر: العشرات يسار والآحاد يمين!";
        feedback.className = "feedback bad";
        playWrong();
      }
    });
  });

  document.querySelectorAll(".reset-exercise").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".exercise-panel") || btn.closest(".slide");
      panel.querySelectorAll("input").forEach((inp) => {
        inp.value = "";
      });
      const feedback = panel.querySelector(".feedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
      }
      playClick();
    });
  });

  /* ---- Drag and drop labs ---- */
  function setupDragLab(lab) {
    const zone = lab.querySelector("[data-drop]");
    const tensEl = lab.querySelector("[data-count-tens]");
    const onesEl = lab.querySelector("[data-count-ones]");
    const checkBtn = lab.querySelector(".check-drag");
    const resetBtn = lab.querySelector(".reset-drag");
    const feedback = lab.querySelector(".feedback");
    let tens = 0;
    let ones = 0;

    function update() {
      tensEl.textContent = String(tens);
      onesEl.textContent = String(ones);
    }

    function resetLab(silent) {
      tens = 0;
      ones = 0;
      zone.querySelectorAll(".placed-ten, .placed-one").forEach((n) => n.remove());
      update();
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
      }
      if (!silent) playClick();
    }

    lab.resetDragLab = resetLab;

    function addPiece(kind) {
      if (kind === "ten") {
        if (tens >= 9) return;
        tens++;
        const el = document.createElement("div");
        el.className = "placed-ten";
        el.dataset.kind = "ten";
        fillTenSegments(el, "placed-ten-unit");
        zone.appendChild(el);
      } else {
        if (ones >= 9) return;
        ones++;
        const el = document.createElement("div");
        el.className = "placed-one";
        el.dataset.kind = "one";
        zone.appendChild(el);
      }
      playPop();
      update();
    }

    lab.querySelectorAll(".drag-item").forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/kind", item.dataset.kind);
        playClick();
      });
      item.addEventListener("click", () => addPiece(item.dataset.kind));
    });

    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("over");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("over");
      addPiece(e.dataTransfer.getData("text/kind"));
    });

    resetBtn?.addEventListener("click", () => resetLab(false));

    checkBtn?.addEventListener("click", () => {
      const needT = Number(lab.dataset.targetTens);
      const needO = Number(lab.dataset.targetOnes);
      if (tens === needT && ones === needO) {
        feedback.textContent = "صحيح 100%! أنت بطل 🌟";
        feedback.className = "feedback ok";
        playSuccess();
        burstConfetti(28);
        addStar(1);
      } else {
        feedback.textContent = `لسه… نحتاج ${needT} عشرات و ${needO} آحاد`;
        feedback.className = "feedback bad";
        playWrong();
      }
    });
  }

  document.querySelectorAll(".drag-lab").forEach(setupDragLab);

  /* ---- Multiple choice ---- */
  document.querySelectorAll(".choice-row").forEach((row) => {
    const correct = row.dataset.correct;
    const feedback = row.parentElement.querySelector(".feedback");
    row.querySelectorAll(".choice-card").forEach((card) => {
      card.addEventListener("click", () => {
        row.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("correct", "wrong"));
        if (card.dataset.choice === correct) {
          card.classList.add("correct");
          feedback.textContent = "أحسنت! هذا هو النموذج الصحيح 🎯";
          feedback.className = "feedback ok";
          playSuccess();
          burstConfetti(22);
          addStar(1);
        } else {
          card.classList.add("wrong");
          feedback.textContent = "مش هيك… جرّب النموذج الثاني!";
          feedback.className = "feedback bad";
          playWrong();
        }
      });
    });
  });

  document.querySelectorAll(".reset-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slide = btn.closest(".slide");
      slide.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("correct", "wrong"));
      const feedback = slide.querySelector(".feedback");
      if (feedback) {
        feedback.textContent = "";
        feedback.className = "feedback";
      }
      playClick();
    });
  });

  /* ---- Matching ---- */
  let selectedModel = null;
  const matches = new Map();

  document.querySelectorAll(".match-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".match-item").forEach((m) => m.classList.remove("selected"));
      if (item.classList.contains("matched")) return;
      item.classList.add("selected");
      selectedModel = item;
      playClick();
    });
  });

  document.querySelectorAll(".match-num").forEach((num) => {
    num.addEventListener("click", () => {
      if (!selectedModel || num.classList.contains("matched")) return;
      if (selectedModel.dataset.val === num.dataset.val) {
        selectedModel.classList.add("matched");
        num.classList.add("matched");
        matches.set(selectedModel.dataset.val, true);
        drawMatchLine(selectedModel, num);
        selectedModel = null;
        document.querySelectorAll(".match-item").forEach((m) => m.classList.remove("selected"));
        playSuccess();
        addStar(1);
      } else {
        playWrong();
        num.classList.add("wrong");
        setTimeout(() => num.classList.remove("wrong"), 400);
      }
    });
  });

  function drawMatchLine(fromEl, toEl) {
    const svg = document.getElementById("matchSvg");
    if (!svg) return;
    const board = svg.parentElement.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - board.left;
    const y1 = a.top + a.height / 2 - board.top;
    const x2 = b.left + b.width / 2 - board.left;
    const y2 = b.top + b.height / 2 - board.top;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "#22c55e");
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  }

  function resetMatchBoard() {
    matches.clear();
    selectedModel = null;
    document.querySelectorAll(".match-item, .match-num").forEach((el) => {
      el.classList.remove("selected", "matched", "wrong");
    });
    const svg = document.getElementById("matchSvg");
    if (svg) svg.innerHTML = "";
    document.querySelectorAll(".match-row input").forEach((inp) => {
      inp.value = "";
    });
    const feedback = document.getElementById("matchFeedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
    playClick();
  }

  document.getElementById("checkMatch")?.addEventListener("click", () => {
    const feedback = document.getElementById("matchFeedback");
    const pairsOk = matches.size === 3;
    let inputsOk = true;
    document.querySelectorAll(".match-row").forEach((row) => {
      const t = row.querySelector("[data-mt]");
      const o = row.querySelector("[data-mo]");
      if (Number(t.value) !== Number(t.dataset.mt) || Number(o.value) !== Number(o.dataset.mo)) {
        inputsOk = false;
      }
    });
    if (pairsOk && inputsOk) {
      feedback.textContent = "توصيل كامل + كتابة صحيحة! أنت نجم ⭐";
      feedback.className = "feedback ok";
      playSuccess();
      burstConfetti(35);
      addStar(2);
    } else if (!pairsOk) {
      feedback.textContent = "أوصل كل النماذج بالأعداد أولاً";
      feedback.className = "feedback bad";
      playWrong();
    } else {
      feedback.textContent = "التوصيل تمام… راجع كتابة الآحاد والعشرات";
      feedback.className = "feedback bad";
      playWrong();
    }
  });

  document.getElementById("resetMatch")?.addEventListener("click", resetMatchBoard);

  /* ---- Create own number ---- */
  const createLab = document.querySelector('.drag-lab[data-dynamic="1"]');
  const myNumberInput = document.getElementById("myNumber");
  const myTensInput = document.getElementById("myTens");
  const myOnesInput = document.getElementById("myOnes");

  function clearCreateBlocks(silent) {
    if (createLab?.resetDragLab) createLab.resetDragLab(silent !== false ? silent : true);
  }

  function resetCreateExercise() {
    if (myNumberInput) myNumberInput.value = "";
    if (myTensInput) myTensInput.value = "";
    if (myOnesInput) myOnesInput.value = "";
    clearCreateBlocks(true);
    const feedback = document.getElementById("createFeedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
    playClick();
  }

  // عند كتابة رقم جديد: فرّغ المستطيل والإجابات عشان يبني من جديد
  myNumberInput?.addEventListener("input", () => {
    clearCreateBlocks(true);
    if (myTensInput) myTensInput.value = "";
    if (myOnesInput) myOnesInput.value = "";
    const feedback = document.getElementById("createFeedback");
    if (feedback) {
      feedback.textContent = "";
      feedback.className = "feedback";
    }
  });

  document.getElementById("checkCreate")?.addEventListener("click", () => {
    const n = Number(myNumberInput.value);
    const t = Number(myTensInput.value);
    const o = Number(myOnesInput.value);
    const tensCount = Number(createLab.querySelector("[data-count-tens]").textContent);
    const onesCount = Number(createLab.querySelector("[data-count-ones]").textContent);
    const feedback = document.getElementById("createFeedback");

    if (!n || n < 10 || n > 99) {
      feedback.textContent = "اكتب عددًا من منزلتين (من 10 إلى 99)";
      feedback.className = "feedback bad";
      playWrong();
      return;
    }
    const needT = Math.floor(n / 10);
    const needO = n % 10;
    if (t === needT && o === needO && tensCount === needT && onesCount === needO) {
      feedback.textContent = `رائع! ${n} = ${needT} عشرات و ${needO} آحاد 🎉`;
      feedback.className = "feedback ok";
      playSuccess();
      burstConfetti(40);
      addStar(2);
    } else {
      feedback.textContent = `تذكّر: ${n} فيه ${needT} عشرات و ${needO} آحاد — وابنِه بالمكعبات كمان`;
      feedback.className = "feedback bad";
      playWrong();
    }
  });

  document.getElementById("resetCreate")?.addEventListener("click", resetCreateExercise);

  function onSlideEnter(slide) {
    if (slide.querySelector("#explore36") && !slide.dataset.played) {
      slide.dataset.played = "1";
      setTimeout(animateExplore36, 300);
    }
  }

  // unlock audio on first interaction
  ["pointerdown", "keydown"].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        try {
          ensureAudio();
        } catch (_) {}
      },
      { once: true }
    );
  });

  goTo(0);
})();
