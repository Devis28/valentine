// script.js
(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");
  const resultEl = document.getElementById("result");

  const PADDING = 10;
  const MAX_MOVES = 2;

  const STORAGE_KEY_BG = "valentine_bg";            // main | yes | no
  const STORAGE_KEY_NEW = "valentine_new_workflow"; // "1" = reset on next load
  const STORAGE_KEY_RESULT = "valentine_result";    // yes | no

  let current = { x: 0, y: 0 };
  let moveCount = 0;
  let frozen = false;

  // uložíme pôvodný text No (aby sme ho vedeli vrátiť späť)
  const initialNoHTML = noBtn.innerHTML;

  // --- BG + RESULT (persist) ---
  function setBackground(mode){
    document.body.classList.remove("bg-main","bg-yes","bg-no");
    document.body.classList.add(`bg-${mode}`);
    localStorage.setItem(STORAGE_KEY_BG, mode);
  }

  function getSavedBackground(){
    return localStorage.getItem(STORAGE_KEY_BG) || "main";
  }

  function triggerNewWorkflow(){
    localStorage.setItem(STORAGE_KEY_NEW, "1");
  }

  function setResult(type){
    if (!resultEl) return;

    if (type === "yes") resultEl.textContent = "💚💖";
    else if (type === "no") resultEl.textContent = "💔😢";
    else resultEl.textContent = "";

    if (type) localStorage.setItem(STORAGE_KEY_RESULT, type);
    else localStorage.removeItem(STORAGE_KEY_RESULT);
  }

  function loadResult(){
    const saved = localStorage.getItem(STORAGE_KEY_RESULT);
    if (saved) setResult(saved);
  }

  function applyBackgroundOnLoad(){
    const shouldReset = localStorage.getItem(STORAGE_KEY_NEW) === "1";

    if (shouldReset) {
      localStorage.removeItem(STORAGE_KEY_NEW);
      localStorage.setItem(STORAGE_KEY_BG, "main");
      localStorage.removeItem(STORAGE_KEY_RESULT);
      setBackground("main");
      setResult(null);
      return;
    }

    setBackground(getSavedBackground());
  }

  // --- NO button movement ---
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

  // --- RESET (invisible) ---
  // Neviditeľná zóna vľavo hore. Po 3 klikoch spraví reset.
  function createInvisibleResetHotspot(){
    const hotspot = document.createElement("button");
    hotspot.type = "button";
    hotspot.setAttribute("aria-label", "Reset");
    hotspot.tabIndex = -1; // neotravuje tabom

    Object.assign(hotspot.style, {
      position: "fixed",
      top: "0px",
      left: "0px",
      width: "56px",
      height: "56px",
      opacity: "0",
      background: "transparent",
      border: "0",
      padding: "0",
      margin: "0",
      zIndex: "9999",
      cursor: "default"
    });

    document.body.appendChild(hotspot);
    return hotspot;
  }

  let resetClicks = 0;
  let resetTimer = null;

  function resetAll(){
    // vizuál
    setBackground("main");
    setResult(null);

    // vráť tlačidlo No do pôvodného stavu + vráť ho na pôvodnú pozíciu
    frozen = false;
    moveCount = 0;
    current = { x: 0, y: 0 };
    noBtn.style.transform = `translate3d(0px, 0px, 0)`;
    noBtn.innerHTML = initialNoHTML;

    // úložisko
    localStorage.setItem(STORAGE_KEY_BG, "main");
    localStorage.removeItem(STORAGE_KEY_RESULT);
    // ak by bol nastavený flag "new workflow", zruš ho tiež
    localStorage.removeItem(STORAGE_KEY_NEW);
  }

  function handleResetClick(){
    resetClicks++;

    // malé okno na 3 kliky (napr. 1.2s), inak sa počítadlo vynuluje
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { resetClicks = 0; }, 1200);

    if (resetClicks >= 3){
      resetClicks = 0;
      clearTimeout(resetTimer);
      resetTimer = null;
      resetAll();
    }
  }

  const resetHotspot = createInvisibleResetHotspot();
  resetHotspot.addEventListener("click", handleResetClick);
  resetHotspot.addEventListener("touchstart", (e) => {
    e.preventDefault();
    handleResetClick();
  }, { passive: false });

  // --- Events ---
  yesBtn.addEventListener("click", () => {
    setBackground("yes");
    setResult("yes");
  });

  noBtn.addEventListener("mouseenter", evade);

  noBtn.addEventListener("touchstart", (e) => {
    if (!frozen) e.preventDefault();
    evade();
  }, { passive: false });

  noBtn.addEventListener("click", () => {
    if (!frozen) return;
    setBackground("no");
    setResult("no");
  });

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

  // INIT
  applyBackgroundOnLoad();
  loadResult();

  // ak chceš reset na "nový workflow" pri odchode, odkomentuj:
  // window.addEventListener("beforeunload", triggerNewWorkflow);
})();
