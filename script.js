// script.js
(() => {
  const yesBtn = document.getElementById("yesBtn");
  const noBtn  = document.getElementById("noBtn");
  const hint   = document.getElementById("hint");

  const PADDING = 10;       // minimálna medzera od okraja obrazovky
  const MAX_NO_CLICKS = 3;  // po 3 klikoch už neuteká

  let noClicks = 0;
  let evasionEnabled = true;

  // Držíme aktuálnu pozíciu cez transform (x,y) v rámci viewportu
  let current = { x: 0, y: 0 };

  function setBackground(mode) {
    if (mode === "yes") {
      document.body.style.background = "var(--bg-yes)";
    } else if (mode === "no") {
      document.body.style.background = "var(--bg-no)";
    } else {
      document.body.style.background = "var(--bg-main)";
    }
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Vygeneruje novú pozíciu tak, aby bolo tlačidlo vždy celé viditeľné na obrazovke
  function computeSafePosition() {
    const rect = noBtn.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Povolený rozsah pre ľavý horný roh tlačidla (v viewport súradniciach)
    const minX = PADDING;
    const minY = PADDING;
    const maxX = window.innerWidth  - w - PADDING;
    const maxY = window.innerHeight - h - PADDING;

    // Ak je extrémne malý viewport, poistka
    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    // Skúsime nájsť pozíciu, ktorá nebude "takmer tá istá"
    let x, y;
    for (let i = 0; i < 10; i++) {
      x = randomInt(minX, safeMaxX);
      y = randomInt(minY, safeMaxY);

      const dx = x - (rect.left);
      const dy = y - (rect.top);
      if (Math.hypot(dx, dy) > 80) break;
    }

    return { x, y };
  }

  // Nastaví transform tak, aby sa tlačidlo presunulo na cieľové (viewport) súradnice
  function moveNoToViewportXY(targetX, targetY) {
    const rect = noBtn.getBoundingClientRect();

    // rozdiel medzi aktuálnym rect a cieľom
    const dx = targetX - rect.left;
    const dy = targetY - rect.top;

    current.x += dx;
    current.y += dy;

    noBtn.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
  }

  function evade() {
    if (!evasionEnabled) return;

    const pos = computeSafePosition();
    moveNoToViewportXY(pos.x, pos.y);
  }

  // --- Events ---

  yesBtn.addEventListener("click", () => {
    setBackground("yes");
    hint.textContent = "Yaaay 💚";
  });

  // "No" sa posunie pri pokuse prejsť kurzorom / dotykom
  noBtn.addEventListener("mouseenter", evade);
  noBtn.addEventListener("touchstart", (e) => {
    // zabráni náhodnému kliknutiu pri touch (najprv uteká)
    if (evasionEnabled) e.preventDefault();
    evade();
  }, { passive: false });

  // Po 3 úspešných kliknutiach sa prestane hýbať a zafarbí na oranžový gradient
  noBtn.addEventListener("click", () => {
    noClicks++;

    if (noClicks < MAX_NO_CLICKS) {
      hint.textContent = `No click: ${noClicks}/3 (ešte utekám 😈)`;
      // po kliknutí sa môže ešte raz pohnúť, aby to bolo "živé"
      evade();
      return;
    }

    // tretí klik = finále
    evasionEnabled = false;
    setBackground("no");
    hint.textContent = "OK… 😅 (už neutekám)";
  });

  // Keď sa zmení veľkosť okna, udrž "No" v bezpečnej oblasti
  window.addEventListener("resize", () => {
    if (!evasionEnabled) return;
    // presuň na bezpečnú pozíciu (ak by sa po resize ocitol mimo)
    const rect = noBtn.getBoundingClientRect();
    const w = rect.width, h = rect.height;

    const minX = PADDING;
    const minY = PADDING;
    const maxX = window.innerWidth  - w - PADDING;
    const maxY = window.innerHeight - h - PADDING;

    const clampedX = clamp(rect.left, minX, Math.max(minX, maxX));
    const clampedY = clamp(rect.top,  minY, Math.max(minY, maxY));

    moveNoToViewportXY(clampedX, clampedY);
  });

  // inicial
  setBackground("main");
})();
