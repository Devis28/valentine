// script.js
(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");
  const hint   = document.getElementById("hint");

  const PADDING = 10;
  const MAX_MOVES = 3;

  // transform offsety
  let current = { x: 0, y: 0 };

  // počítame PRESUNY (nie kliky)
  let moveCount = 0;
  let frozen = false; // keď true, už neuteká

  function setBackground(mode) {
    if (mode === "yes") document.body.style.background = "var(--bg-yes)";
    else if (mode === "no") document.body.style.background = "var(--bg-no)";
    else document.body.style.background = "var(--bg-main)";
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function computeSafePosition() {
    const rect = noBtn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const minX = PADDING;
    const minY = PADDING;
    const maxX = Math.max(minX, window.innerWidth  - w - PADDING);
    const maxY = Math.max(minY, window.innerHeight - h - PADDING);

    let x = randomInt(minX, maxX);
    let y = randomInt(minY, maxY);

    // skús sa vyhnúť mikropohybu
    for (let i = 0; i < 8; i++) {
      const dx = x - rect.left;
      const dy = y - rect.top;
      if (Math.hypot(dx, dy) > 80) break;
      x = randomInt(minX, maxX);
      y = randomInt(minY, maxY);
    }

    return { x, y };
  }

  function moveNoToViewportXY(targetX, targetY) {
    const rect = noBtn.getBoundingClientRect();
    const dx = targetX - rect.left;
    const dy = targetY - rect.top;

    current.x += dx;
    current.y += dy;

    noBtn.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
  }

  function freezeNo() {
    frozen = true;
    // text s novým riadkom cez <br>
    noBtn.innerHTML = `No<br>Okay, tap me`;
    hint.textContent = "Už neutekám 😅";
  }

  function evade() {
    if (frozen) return;

    // ak už máme 3 presuny, stop
    if (moveCount >= MAX_MOVES) {
      freezeNo();
      return;
    }

    const pos = computeSafePosition();
    moveNoToViewportXY(pos.x, pos.y);

    moveCount++;
    if (moveCount >= MAX_MOVES) {
      // po treťom presune hneď “zamrzni”
      freezeNo();
    } else {
      hint.textContent = `Presun ${moveCount}/${MAX_MOVES}`;
    }
  }

  // YES = zelený gradient
  yesBtn.addEventListener("click", () => {
    setBackground("yes");
    hint.textContent = "Yaaay 💚";
  });

  // NO: uteká len 3x na hover/touch
  noBtn.addEventListener("mouseenter", evade);

  noBtn.addEventListener("touchstart", (e) => {
    // keď ešte neutiekol 3x, nech sa pri touch najprv uhne (bez kliknutia)
    if (!frozen) e.preventDefault();
    evade();
  }, { passive: false });

  // NO: až keď je zmrazený, klik nastaví oranžový gradient
  noBtn.addEventListener("click", () => {
    if (!frozen) return; // kým neutiekol 3x, klik nič nerobí
    setBackground("no");
    hint.textContent = "Ok… orange it is 🧡";
  });

  // resize poistka (len keď ešte neuteká)
  window.addEventListener("resize", () => {
    if (frozen) return;

    const rect = noBtn.getBoundingClientRect();
    const w = rect.width, h = rect.height;

    const minX = PADDING;
    const minY = PADDING;
    const maxX = Math.max(minX, window.innerWidth  - w - PADDING);
    const maxY = Math.max(minY, window.innerHeight - h - PADDING);

    const clampedX = Math.min(Math.max(rect.left, minX), maxX);
    const clampedY = Math.min(Math.max(rect.top,  minY), maxY);

    moveNoToViewportXY(clampedX, clampedY);
  });

  // init
  setBackground("main");
})();
