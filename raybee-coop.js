(() => {
  "use strict";

  const WORLD = { width: 1280, height: 720 };
  const canvas = document.querySelector("#gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    hud: document.querySelector("#hud"),
    chapterNumber: document.querySelector("#chapterNumber"),
    chapterTitle: document.querySelector("#chapterTitle"),
    heartMeter: document.querySelector("#heartMeter"),
    heartCount: document.querySelector("#heartCount"),
    helpButton: document.querySelector("#helpButton"),
    soundButton: document.querySelector("#soundButton"),
    instructionPanel: document.querySelector("#instructionPanel"),
    instructionTitle: document.querySelector("#instructionTitle"),
    instructionText: document.querySelector("#instructionText"),
    instructionControls: document.querySelector("#instructionControls"),
    instructionDismiss: document.querySelector("#instructionDismiss"),
    startScreen: document.querySelector("#startScreen"),
    startButton: document.querySelector("#startButton"),
    memoryScreen: document.querySelector("#memoryScreen"),
    memoryImage: document.querySelector("#memoryImage"),
    memoryKicker: document.querySelector("#memoryKicker"),
    memoryTitle: document.querySelector("#memoryTitle"),
    memoryText: document.querySelector("#memoryText"),
    memoryContinue: document.querySelector("#memoryContinue"),
    questionScreen: document.querySelector("#questionScreen"),
    questionProgress: document.querySelector("#questionProgress"),
    questionTitle: document.querySelector("#questionTitle"),
    questionChoices: document.querySelector("#questionChoices"),
    answerNote: document.querySelector("#answerNote"),
    rhythmScreen: document.querySelector("#rhythmScreen"),
    rhythmTarget: document.querySelector("#rhythmTarget"),
    rhythmStatus: document.querySelector("#rhythmStatus"),
    rhythmProgress: document.querySelector("#rhythmProgress"),
    buildScreen: document.querySelector("#buildScreen"),
    buildStatus: document.querySelector("#buildStatus"),
    buildWorkspace: document.querySelector(".build-workspace"),
    finalScreen: document.querySelector("#finalScreen"),
    replayButton: document.querySelector("#replayButton"),
    objective: document.querySelector("#objective"),
    joystickWrap: document.querySelector("#joystickWrap"),
    joystick: document.querySelector("#joystick"),
    joystickKnob: document.querySelector("#joystickKnob"),
    backgroundMusic: document.querySelector("#backgroundMusic")
  };

  const memories = [
    {
      image: "assets/photos/everything-better.jpeg",
      alt: "Ray and Bee holding hands at the cinema",
      kicker: "The first spark",
      title: "I found you in the music",
      text:
        "That night at Koda, in a room full of people and sound, I found the person who would make ordinary moments feel brighter. I am forever grateful I asked for your number."
    },
    {
      image: "assets/photos/golden-hearts.jpeg",
      alt: "Ray and Bee holding hands during a bright drive",
      kicker: "Golden hearts",
      title: "Honey among rocks",
      text:
        "The drives, the music, the held hands and the light between us. You made the smallest moments feel warm enough to keep forever."
    },
    {
      image: "assets/photos/care.jpeg",
      alt: "Bee gently touching Ray's face while they hold hands",
      kicker: "Love in practice",
      title: "How you take care of me",
      text:
        "You love in details: checking on me, soft hands, honest words, long calls and the quiet ways you make me feel seen. I notice all of it."
    },
    {
      image: "assets/photos/pentagon-five.jpeg",
      alt: "Ray, Bee, Mike, Mel, and Qwarra at the cinema",
      kicker: "Pentagon 5",
      title: "Our people, our laughter",
      text:
        "You did not only become part of my heart. You found your place beside the people I love, and somehow the whole picture became brighter."
    },
    {
      image: "assets/photos/video-calls.jpeg",
      alt: "Ray and Bee smiling during a video call",
      kicker: "Always near",
      title: "Even through a screen",
      text:
        "Our calls made distance feel small. Your smile, your voice and the ordinary updates became some of my favourite parts of every day."
    }
  ];

  const chapterInstructions = {
    1: {
      title: "Find each other",
      text: "Guide Ray along the dotted path until he reaches Bee.",
      controls:
        "Phone: drag the pink joystick or tap the floor. Computer: use WASD or the arrow keys."
    },
    2: {
      title: "Collect our golden hearts",
      text: "Move the two of you into every glowing heart until the counter reaches six.",
      controls:
        "Phone: drag the joystick or tap near a heart. Computer: use WASD or the arrow keys."
    },
    3: {
      title: "Play our question game",
      text: "Choose the answer that feels most like us. The next question appears automatically.",
      controls: "Tap one answer for each of the three questions. There are no wrong choices."
    },
    4: {
      title: "Catch the Koda rhythm",
      text: "Look at the large arrow, then press the matching direction to complete all eight beats.",
      controls: "Phone: tap the arrow buttons. Computer: use the arrow keys or WASD."
    },
    5: {
      title: "Build our co-op code",
      text: "Choose a word below the code, then place it in the matching dotted slot.",
      controls: "Fill all four slots. A wrong match simply lets you try another line."
    }
  };

  const questions = [
    {
      title: "A perfect date begins with...",
      choices: ["A favourite question game", "Music and a long drive"],
      reply: "Exactly. The best plans leave room for us to keep discovering each other."
    },
    {
      title: "The best seat will always be...",
      choices: ["Right next to you", "Still right next to you"],
      reply: "No debate needed. As long as you are next to me, I am good."
    },
    {
      title: "When the world gets loud, we...",
      choices: ["Hold hands", "Choose each other again"],
      reply: "Both. Soft hands, honest hearts, and another little memory unlocked."
    }
  ];

  const rhythmSequence = ["left", "up", "right", "down", "up", "left", "down", "right"];
  const arrows = { left: "←", up: "↑", down: "↓", right: "→" };
  const keys = new Set();
  const view = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    dpr: 1,
    width: window.innerWidth,
    height: window.innerHeight,
    portrait: false,
    cameraX: WORLD.width / 2
  };
  const input = { x: 0, y: 0, pointerTarget: null };

  let mode = "start";
  let scene = "meet";
  let lastTime = performance.now();
  let currentMemory = 0;
  let memoryNext = null;
  let questionIndex = 0;
  let rhythmIndex = 0;
  let selectedToken = null;
  let soundEnabled = true;
  let audioContext = null;
  let dancePulse = 0;
  let completionLocked = false;
  let joystickPointer = null;
  let activeChapter = 1;
  let instructionsOpen = false;

  const ray = { x: 190, y: 490, speed: 285, facing: 1 };
  const bee = { x: 1050, y: 350, facing: -1 };
  const pair = { x: 180, y: 520, speed: 275, facing: 1 };
  let hearts = [];

  setup();

  function setup() {
    ui.hud.hidden = true;
    ui.objective.hidden = true;
    ui.joystickWrap.hidden = true;
    ui.backgroundMusic.volume = 0.24;

    for (let index = 0; index < rhythmSequence.length; index += 1) {
      const step = document.createElement("span");
      ui.rhythmProgress.append(step);
    }

    ui.startButton.addEventListener("click", startGame);
    ui.helpButton.addEventListener("click", toggleInstructions);
    ui.instructionDismiss.addEventListener("click", () => setInstructionsOpen(false));
    ui.soundButton.addEventListener("click", toggleSound);
    ui.memoryContinue.addEventListener("click", continueFromMemory);
    ui.replayButton.addEventListener("click", resetGame);

    document.querySelectorAll("[data-direction]").forEach((button) => {
      button.addEventListener("click", () => handleRhythmInput(button.dataset.direction));
    });

    document.querySelectorAll("[data-token]").forEach((button) => {
      button.addEventListener("click", () => selectCodeToken(button));
    });

    document.querySelectorAll("[data-slot]").forEach((slot) => {
      slot.addEventListener("click", () => placeCodeToken(slot));
    });

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", handleCanvasPointer);

    ui.joystick.addEventListener("pointerdown", beginJoystick);
    ui.joystick.addEventListener("pointermove", moveJoystick);
    ui.joystick.addEventListener("pointerup", endJoystick);
    ui.joystick.addEventListener("pointercancel", endJoystick);

    resize();
    requestAnimationFrame(frame);
  }

  function startGame() {
    mode = "world";
    scene = "meet";
    view.cameraX = ray.x;
    ui.startScreen.hidden = true;
    ui.hud.hidden = false;
    ui.objective.hidden = false;
    ui.joystickWrap.hidden = false;
    setChapter(1, "Find each other");
    ui.objective.textContent = "Walk to Bee";
    void startMusic();
  }

  function resetGame() {
    ray.x = 190;
    ray.y = 490;
    bee.x = 1050;
    bee.y = 350;
    pair.x = 180;
    pair.y = 520;
    hearts = [];
    currentMemory = 0;
    questionIndex = 0;
    rhythmIndex = 0;
    selectedToken = null;
    dancePulse = 0;
    completionLocked = false;
    view.cameraX = ray.x;
    input.pointerTarget = null;

    document.querySelectorAll("[data-slot]").forEach((slot) => {
      slot.textContent = "...";
      slot.classList.remove("is-filled");
      slot.dataset.filled = "";
    });
    document.querySelectorAll("[data-token]").forEach((token) => {
      token.disabled = false;
      token.classList.remove("is-selected");
    });
    [...ui.rhythmProgress.children].forEach((step) => step.classList.remove("is-complete"));

    ui.finalScreen.hidden = true;
    ui.heartMeter.hidden = true;
    ui.startScreen.hidden = true;
    ui.hud.hidden = false;
    ui.objective.hidden = false;
    ui.joystickWrap.hidden = false;
    mode = "world";
    scene = "meet";
    setChapter(1, "Find each other");
    ui.objective.textContent = "Walk to Bee";
    ui.finalScreen.scrollTop = 0;
  }

  function setChapter(number, title) {
    activeChapter = number;
    ui.chapterNumber.textContent = `Chapter ${number} of 5`;
    ui.chapterTitle.textContent = title;
    ui.helpButton.hidden = false;
    showChapterInstructions(number);
  }

  function showChapterInstructions(number) {
    const instructions = chapterInstructions[number];
    if (!instructions) return;
    ui.instructionTitle.textContent = instructions.title;
    ui.instructionText.textContent = instructions.text;
    ui.instructionControls.textContent = instructions.controls;
    setInstructionsOpen(true);
  }

  function toggleInstructions() {
    if (instructionsOpen) {
      setInstructionsOpen(false);
    } else {
      showChapterInstructions(activeChapter);
    }
  }

  function setInstructionsOpen(open) {
    instructionsOpen = open;
    ui.instructionPanel.hidden = !open;
    ui.helpButton.setAttribute("aria-expanded", String(open));
    ui.helpButton.setAttribute("aria-label", open ? "Hide instructions" : "Show instructions");
    ui.helpButton.title = open ? "Hide instructions" : "Show instructions";

    if (open) {
      keys.clear();
      input.x = 0;
      input.y = 0;
      input.pointerTarget = null;
      ui.joystickKnob.style.transform = "translate(-50%, -50%)";
    }
  }

  async function startMusic() {
    if (!soundEnabled) return;
    try {
      await ui.backgroundMusic.play();
    } catch {
      ui.soundButton.textContent = "Sound off";
      soundEnabled = false;
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    ui.soundButton.textContent = soundEnabled ? "Sound on" : "Sound off";
    if (soundEnabled) {
      void startMusic();
    } else {
      ui.backgroundMusic.pause();
    }
  }

  function showMemory(index, next) {
    const memory = memories[index];
    currentMemory = index;
    memoryNext = next;
    mode = "memory";
    input.pointerTarget = null;
    setInstructionsOpen(false);
    ui.helpButton.hidden = true;
    ui.memoryImage.src = memory.image;
    ui.memoryImage.alt = memory.alt;
    ui.memoryKicker.textContent = memory.kicker;
    ui.memoryTitle.textContent = memory.title;
    ui.memoryText.textContent = memory.text;
    ui.memoryScreen.hidden = false;
    ui.objective.hidden = true;
    ui.joystickWrap.hidden = true;
  }

  function continueFromMemory() {
    ui.memoryScreen.hidden = true;
    if (typeof memoryNext === "function") memoryNext();
  }

  function startHeartLevel() {
    mode = "world";
    scene = "hearts";
    pair.x = 180;
    pair.y = 520;
    view.cameraX = pair.x;
    input.pointerTarget = null;
    hearts = [
      { x: 320, y: 480, found: false },
      { x: 480, y: 330, found: false },
      { x: 655, y: 520, found: false },
      { x: 820, y: 300, found: false },
      { x: 980, y: 470, found: false },
      { x: 1110, y: 250, found: false }
    ];
    setChapter(2, "Golden hearts");
    ui.heartMeter.hidden = false;
    ui.heartCount.textContent = "0";
    ui.objective.hidden = false;
    ui.objective.textContent = "Collect six golden hearts";
    ui.joystickWrap.hidden = false;
  }

  function showQuestionGame() {
    mode = "questions";
    ui.heartMeter.hidden = true;
    ui.objective.hidden = true;
    ui.joystickWrap.hidden = true;
    ui.questionScreen.hidden = false;
    questionIndex = 0;
    renderQuestion();
    setChapter(3, "Our question game");
  }

  function renderQuestion() {
    const question = questions[questionIndex];
    ui.questionProgress.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
    ui.questionTitle.textContent = question.title;
    ui.answerNote.textContent = "";
    ui.questionChoices.replaceChildren();

    question.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice;
      button.addEventListener("click", () => answerQuestion(question));
      ui.questionChoices.append(button);
    });
  }

  function answerQuestion(question) {
    if (instructionsOpen || completionLocked) return;
    completionLocked = true;
    ui.answerNote.textContent = question.reply;
    ui.questionChoices.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    playChime(520);

    window.setTimeout(() => {
      questionIndex += 1;
      completionLocked = false;
      if (questionIndex < questions.length) {
        renderQuestion();
      } else {
        ui.questionScreen.hidden = true;
        showMemory(2, startRhythmGame);
      }
    }, 1250);
  }

  function startRhythmGame() {
    mode = "rhythm";
    rhythmIndex = 0;
    dancePulse = 0;
    view.cameraX = WORLD.width / 2;
    setChapter(4, "Koda dance floor");
    ui.rhythmScreen.hidden = false;
    ui.rhythmStatus.textContent = "Eight little beats, no wrong kind of dancing.";
    updateRhythmTarget();
  }

  function handleRhythmInput(direction) {
    if (instructionsOpen || mode !== "rhythm" || completionLocked) return;
    if (direction !== rhythmSequence[rhythmIndex]) {
      ui.rhythmTarget.classList.remove("is-hit");
      ui.rhythmTarget.classList.add("is-miss");
      ui.rhythmStatus.textContent = "Close. Find our beat and try that step again.";
      window.setTimeout(() => ui.rhythmTarget.classList.remove("is-miss"), 180);
      playChime(150);
      return;
    }

    dancePulse = 1;
    ui.rhythmTarget.classList.remove("is-miss");
    ui.rhythmTarget.classList.add("is-hit");
    ui.rhythmProgress.children[rhythmIndex].classList.add("is-complete");
    rhythmIndex += 1;
    playChime(330 + rhythmIndex * 46);

    if (rhythmIndex >= rhythmSequence.length) {
      completionLocked = true;
      ui.rhythmStatus.textContent = "That is our step.";
      window.setTimeout(() => {
        ui.rhythmScreen.hidden = true;
        completionLocked = false;
        showMemory(3, startBuildGame);
      }, 900);
      return;
    }

    window.setTimeout(() => {
      ui.rhythmTarget.classList.remove("is-hit");
      updateRhythmTarget();
    }, 130);
  }

  function updateRhythmTarget() {
    ui.rhythmTarget.querySelector("span").textContent = arrows[rhythmSequence[rhythmIndex]];
  }

  function startBuildGame() {
    mode = "build";
    selectedToken = null;
    setChapter(5, "Build together");
    ui.buildScreen.hidden = false;
    ui.buildStatus.textContent = "Select a word, then place it in its matching line.";
  }

  function selectCodeToken(button) {
    if (instructionsOpen || button.disabled) return;
    selectedToken = button.dataset.token;
    document.querySelectorAll("[data-token]").forEach((token) => {
      token.classList.toggle("is-selected", token === button);
    });
    ui.buildStatus.textContent = `${button.textContent} selected.`;
  }

  function placeCodeToken(slot) {
    if (instructionsOpen) return;
    if (!selectedToken || slot.dataset.filled) {
      ui.buildStatus.textContent = selectedToken
        ? "That line is already complete."
        : "Choose one of the words first.";
      return;
    }

    if (slot.dataset.slot !== selectedToken) {
      ui.buildStatus.textContent = "That belongs in another line.";
      ui.buildWorkspace.classList.add("is-wrong");
      playChime(150);
      window.setTimeout(() => ui.buildWorkspace.classList.remove("is-wrong"), 220);
      return;
    }

    const tokenButton = document.querySelector(`[data-token="${selectedToken}"]`);
    slot.textContent = tokenButton.textContent;
    slot.dataset.filled = selectedToken;
    slot.classList.add("is-filled");
    tokenButton.disabled = true;
    tokenButton.classList.remove("is-selected");
    selectedToken = null;
    playChime(480);

    const remaining = [...document.querySelectorAll("[data-slot]")].filter(
      (candidate) => !candidate.dataset.filled
    ).length;

    if (remaining === 0) {
      ui.buildStatus.textContent = "Build successful: RayBee co-op is ready.";
      completionLocked = true;
      window.setTimeout(() => {
        ui.buildScreen.hidden = true;
        completionLocked = false;
        showMemory(4, showFinale);
      }, 950);
    } else {
      ui.buildStatus.textContent = `${remaining} line${remaining === 1 ? "" : "s"} left to complete.`;
    }
  }

  function showFinale() {
    mode = "final";
    setInstructionsOpen(false);
    ui.helpButton.hidden = true;
    ui.hud.hidden = true;
    ui.objective.hidden = true;
    ui.joystickWrap.hidden = true;
    ui.finalScreen.hidden = false;
    ui.finalScreen.scrollTop = 0;
    playChime(660);
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (instructionsOpen) {
      if (key === "escape") setInstructionsOpen(false);
      return;
    }

    const movementKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
    if (movementKeys.includes(key)) event.preventDefault();

    if (mode === "rhythm") {
      const direction = {
        arrowleft: "left",
        a: "left",
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowright: "right",
        d: "right"
      }[key];
      if (direction && !event.repeat) handleRhythmInput(direction);
      return;
    }

    keys.add(key);
  }

  function handleCanvasPointer(event) {
    if (instructionsOpen || mode !== "world") return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - view.offsetX) / view.scale;
    const y = (event.clientY - rect.top - view.offsetY) / view.scale;
    input.pointerTarget = {
      x: clamp(x, 70, WORLD.width - 70),
      y: clamp(y, 145, WORLD.height - 65)
    };
  }

  function beginJoystick(event) {
    if (instructionsOpen) return;
    joystickPointer = event.pointerId;
    ui.joystick.setPointerCapture(event.pointerId);
    updateJoystick(event);
  }

  function moveJoystick(event) {
    if (event.pointerId !== joystickPointer) return;
    updateJoystick(event);
  }

  function endJoystick(event) {
    if (event.pointerId !== joystickPointer) return;
    joystickPointer = null;
    input.x = 0;
    input.y = 0;
    ui.joystickKnob.style.transform = "translate(-50%, -50%)";
  }

  function updateJoystick(event) {
    const rect = ui.joystick.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const radius = rect.width * 0.3;
    const length = Math.hypot(dx, dy) || 1;
    const amount = Math.min(radius, length);
    const nx = dx / length;
    const ny = dy / length;
    input.x = nx * (amount / radius);
    input.y = ny * (amount / radius);
    ui.joystickKnob.style.transform =
      `translate(calc(-50% + ${nx * amount}px), calc(-50% + ${ny * amount}px))`;
  }

  function frame(time) {
    const delta = Math.min(0.04, (time - lastTime) / 1000);
    lastTime = time;
    update(delta);
    updateCamera(delta);
    draw(time / 1000);
    requestAnimationFrame(frame);
  }

  function update(delta) {
    dancePulse = Math.max(0, dancePulse - delta * 2.8);
    if (instructionsOpen) return;
    if (mode !== "world") return;

    const controlled = scene === "meet" ? ray : pair;
    const direction = getMovementDirection(controlled);
    if (direction.x || direction.y) {
      controlled.x += direction.x * controlled.speed * delta;
      controlled.y += direction.y * controlled.speed * delta;
      controlled.facing = direction.x === 0 ? controlled.facing : Math.sign(direction.x);
      controlled.x = clamp(controlled.x, 72, WORLD.width - 72);
      controlled.y = clamp(controlled.y, 150, WORLD.height - 64);
    }

    if (scene === "meet" && distance(ray, bee) < 92 && !completionLocked) {
      completionLocked = true;
      input.pointerTarget = null;
      window.setTimeout(() => {
        completionLocked = false;
        showMemory(0, startHeartLevel);
      }, 220);
    }

    if (scene === "hearts") {
      hearts.forEach((heart) => {
        if (!heart.found && Math.hypot(pair.x - heart.x, pair.y - heart.y) < 72) {
          heart.found = true;
          const total = hearts.filter((candidate) => candidate.found).length;
          ui.heartCount.textContent = String(total);
          playChime(410 + total * 35);
          if (total === hearts.length && !completionLocked) {
            completionLocked = true;
            window.setTimeout(() => {
              completionLocked = false;
              showMemory(1, showQuestionGame);
            }, 350);
          }
        }
      });
    }
  }

  function getMovementDirection(controlled) {
    let x = input.x;
    let y = input.y;
    if (keys.has("a") || keys.has("arrowleft")) x -= 1;
    if (keys.has("d") || keys.has("arrowright")) x += 1;
    if (keys.has("w") || keys.has("arrowup")) y -= 1;
    if (keys.has("s") || keys.has("arrowdown")) y += 1;

    if (!x && !y && input.pointerTarget) {
      const dx = input.pointerTarget.x - controlled.x;
      const dy = input.pointerTarget.y - controlled.y;
      const length = Math.hypot(dx, dy);
      if (length < 10) {
        input.pointerTarget = null;
      } else {
        x = dx / length;
        y = dy / length;
      }
    }

    const length = Math.hypot(x, y);
    return length > 1 ? { x: x / length, y: y / length } : { x, y };
  }

  function draw(time) {
    clearCanvas();
    if (mode === "rhythm") {
      drawKodaStage(time, true);
      drawDancingCouple(time);
      return;
    }
    if (mode !== "world") {
      drawKodaStage(time, false);
      return;
    }

    if (scene === "meet") {
      drawKodaStage(time, false);
      drawPerson(ray.x, ray.y, "ray", ray.facing, time);
      drawPerson(bee.x, bee.y, "bee", bee.facing, time + 0.8, true);
      drawMeetingLine(time);
    } else {
      drawHeartRoad(time);
      hearts.forEach((heart, index) => {
        if (!heart.found) drawHeart(heart.x, heart.y, 22, time + index * 0.4);
      });
      drawCouple(pair.x, pair.y, pair.facing, time);
    }
  }

  function clearCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(
      view.dpr * view.scale,
      0,
      0,
      view.dpr * view.scale,
      view.dpr * view.offsetX,
      view.dpr * view.offsetY
    );
  }

  function drawKodaStage(time, danceMode) {
    ctx.fillStyle = "#111319";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);

    ctx.fillStyle = "#261b25";
    ctx.fillRect(0, 105, WORLD.width, 270);
    ctx.fillStyle = "#3e2130";
    ctx.fillRect(0, 375, WORLD.width, WORLD.height - 375);

    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    for (let x = 40; x < WORLD.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 375);
      ctx.lineTo(WORLD.width / 2 + (x - WORLD.width / 2) * 1.7, WORLD.height);
      ctx.stroke();
    }
    for (let y = 410; y < WORLD.height; y += 62) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(WORLD.width, y);
      ctx.stroke();
    }

    const colors = ["#f45f8f", "#f3c86b", "#5da783", "#ff8277"];
    for (let index = 0; index < 11; index += 1) {
      ctx.fillStyle = colors[index % colors.length];
      const height = 14 + Math.sin(time * 2.4 + index) * 6;
      ctx.fillRect(66 + index * 116, 126, 70, height);
    }

    ctx.fillStyle = "#fff8f8";
    ctx.font = "900 26px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("KODA · 3 STEP THEORY", WORLD.width / 2, 205);
    ctx.fillStyle = "#f3c86b";
    ctx.font = "700 14px system-ui";
    ctx.fillText(danceMode ? "THE FLOOR WHERE OUR STORY KEEPS MOVING" : "THE NIGHT WE FOUND EACH OTHER", WORLD.width / 2, 234);
  }

  function drawHeartRoad(time) {
    ctx.fillStyle = "#191b22";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = "#25342d";
    ctx.fillRect(0, 105, WORLD.width, 255);
    ctx.fillStyle = "#2a2228";
    ctx.fillRect(0, 360, WORLD.width, WORLD.height - 360);

    ctx.fillStyle = "#ed8d91";
    ctx.fillRect(0, 420, WORLD.width, 8);
    ctx.fillStyle = "#f3c86b";
    for (let x = 40; x < WORLD.width; x += 94) {
      ctx.fillRect(x, 300 + Math.sin(time + x) * 4, 42, 4);
    }

    ctx.fillStyle = "#fff8f8";
    ctx.font = "900 25px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("THE GOLDEN-HEART ROAD", WORLD.width / 2, 188);
    ctx.fillStyle = "#d4c9ce";
    ctx.font = "700 14px system-ui";
    ctx.fillText("EVERY SMALL MOMENT COUNTS", WORLD.width / 2, 216);
  }

  function drawMeetingLine(time) {
    const alpha = 0.26 + Math.sin(time * 2) * 0.08;
    ctx.save();
    ctx.strokeStyle = `rgba(243, 200, 107, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(ray.x + 35, ray.y - 42);
    ctx.lineTo(bee.x - 35, bee.y - 42);
    ctx.stroke();
    ctx.restore();
  }

  function drawPerson(x, y, who, facing, time, waving = false) {
    const isRay = who === "ray";
    const bob = Math.sin(time * 4) * 3;
    const skin = "#74442f";
    ctx.save();
    ctx.translate(x, y + bob);
    ctx.scale(facing || 1, 1);

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 10, 42, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#16181d";
    ctx.lineWidth = 13;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-14, -28);
    ctx.lineTo(-18, 5);
    ctx.moveTo(14, -28);
    ctx.lineTo(18, 5);
    ctx.stroke();

    ctx.fillStyle = isRay ? "#d8c7a8" : "#cb315c";
    ctx.beginPath();
    ctx.roundRect(-32, -108, 64, 82, 16);
    ctx.fill();

    if (isRay) {
      ctx.fillStyle = "#f1e9da";
      ctx.fillRect(-31, -92, 62, 13);
      ctx.fillRect(-31, -61, 62, 13);
    }

    ctx.strokeStyle = skin;
    ctx.lineWidth = 13;
    ctx.beginPath();
    ctx.moveTo(-27, -92);
    ctx.lineTo(-46, -47);
    ctx.moveTo(27, -92);
    ctx.lineTo(waving ? 52 : 43, waving ? -126 : -54);
    ctx.stroke();

    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.arc(0, -138, 31, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#15161a";
    if (isRay) {
      ctx.beginPath();
      ctx.arc(0, -151, 30, Math.PI, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(-7, -148, 34, 30, -0.25, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-38, -151, 18, 77);
    }

    ctx.strokeStyle = "#373b45";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-25, -145, 21, 13, 5);
    ctx.roundRect(4, -145, 21, 13, 5);
    ctx.moveTo(-4, -139);
    ctx.lineTo(4, -139);
    ctx.stroke();

    ctx.strokeStyle = "#fff8f8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(2, -128, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.scale(facing || 1, 1);
    ctx.fillStyle = "#fff8f8";
    ctx.font = "900 13px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(isRay ? "RAY" : "BEE", 0, -181);
    ctx.restore();
  }

  function drawCouple(x, y, facing, time) {
    const offset = 32;
    drawPerson(x - offset, y, "bee", facing, time);
    drawPerson(x + offset, y + 2, "ray", facing, time + 0.22);
    ctx.save();
    ctx.strokeStyle = "#74442f";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 70);
    ctx.lineTo(x + 8, y - 68);
    ctx.stroke();
    ctx.restore();
  }

  function drawDancingCouple(time) {
    const pulse = dancePulse * 15;
    const sway = Math.sin(time * 5) * 8;
    drawPerson(565 - sway, 520 - pulse, "bee", 1, time * 1.6);
    drawPerson(715 + sway, 520 - pulse, "ray", -1, time * 1.6 + 0.4);

    ctx.save();
    ctx.strokeStyle = "#f3c86b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(603, 442 - pulse);
    ctx.lineTo(677, 442 - pulse);
    ctx.stroke();
    ctx.restore();
  }

  function drawHeart(x, y, size, time) {
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "#f3c86b";
    ctx.beginPath();
    ctx.moveTo(0, size * 0.84);
    ctx.bezierCurveTo(-size * 1.25, size * 0.1, -size * 0.95, -size, 0, -size * 0.42);
    ctx.bezierCurveTo(size * 0.95, -size, size * 1.25, size * 0.1, 0, size * 0.84);
    ctx.fill();
    ctx.restore();
  }

  function playChime(frequency) {
    if (!soundEnabled) return;
    try {
      audioContext ||= new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.18);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      // The game remains fully playable when audio is unavailable.
    }
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    view.width = width;
    view.height = height;
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.portrait = width / height < 0.74;

    if (view.portrait) {
      view.scale = Math.max(width / 720, height / 900);
      view.offsetX = width / 2 - view.cameraX * view.scale;
    } else {
      view.scale = Math.min(width / WORLD.width, height / WORLD.height);
      view.offsetX = (width - WORLD.width * view.scale) / 2;
    }

    view.offsetY = (height - WORLD.height * view.scale) / 2;
    canvas.width = Math.round(width * view.dpr);
    canvas.height = Math.round(height * view.dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }

  function updateCamera(delta) {
    if (!view.portrait) return;

    let target = WORLD.width / 2;
    if (mode === "world") {
      target = scene === "meet" ? ray.x : pair.x;
    }

    const visibleWidth = view.width / view.scale;
    const halfWidth = visibleWidth / 2;
    target = clamp(target, halfWidth, WORLD.width - halfWidth);
    const smoothing = 1 - Math.pow(0.002, delta);
    view.cameraX += (target - view.cameraX) * smoothing;
    view.offsetX = view.width / 2 - view.cameraX * view.scale;
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
