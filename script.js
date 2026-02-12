// script.js
(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");

  const PADDING = 10;
  const MAX_MOVES = 2;

  const STORAGE_KEY_BG = "valentine_bg"; // main | yes | no

  let current = { x: 0, y: 0 };
  let moveCount = 0;
  let frozen = false;

  function saveBackground(mode){
    localStorage.setItem(STORAGE_KEY_BG, mode);
  }

  function loadBackground(){
    return localStorage.getItem(STORAGE_KEY_BG) || "main";
  }

  function setBackground(mode){
    document.body.classList.remove("bg-main","bg-yes","bg-no");
    document.body.classList.add(`bg-${mode}`);
    saveBackground(mode);
  }

  function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function computeSafePosition(){
    const rect = noBtn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const minX = PADDING;
    const minY = PADDING;
    const maxX = Math.max(minX, window.innerWidth  - w - PADDING);
    const maxY = Math.max(minY, window.innerHeight - h - PADDING);

    let x = randomInt(minX, maxX);
    let y = randomInt(minY, maxY);

    for (let i = 0; i < 8; i++) {
      const dx = x - rect.left;
      const dy = y - rect.top;
      if (Math.hypot(dx, dy) > 80) break;
      x = randomInt(minX, maxX);
      y = randomInt(minY, maxY);
    }

    return { x, y };
  }

  function moveNoToViewportXY(targetX, targetY){
    const rect = noBtn.getBoundingClientRect();
    const dx = targetX - rect.left;
    const dy = targetY - rect.top;

    current.x += dx;
    current.y += dy;

    noBtn.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
  }

  function freezeNo(){
    frozen = true;
    noBtn.innerHTML = `No<br>Okay, tap me`;
  }

  function evade(){
    if (frozen) return;

    if (moveCount >= MAX_MOVES){
      freezeNo();
      return;
    }

    const pos = computeSafePosition();
    moveNoToViewportXY(pos.x, pos.y);

    moveCount++;

    if (moveCount >= MAX_MOVES){
      freezeNo();
    }
  }

  // YES -> zelený gradient (a uložiť)
  yesBtn.addEventListener("click", () => setBackground("yes"));

  // NO uteká len MAX_MOVES krát
  noBtn.addEventListener("mouseenter", evade);

  noBtn.addEventListener("touchstart", (e) => {
    if (!frozen) e.preventDefault();
    evade();
  }, { passive: false });

  // NO -> oranžový gradient až keď je frozen (a uložiť)
  noBtn.addEventListener("click", () => {
    if (!frozen) return;
    setBackground("no");
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

  // INIT: nastav background podľa uloženého stavu
  setBackground(loadBackground());
})();
