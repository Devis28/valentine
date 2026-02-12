const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const result = document.getElementById("result");

const STORAGE_KEY = "valentine_choice";
const NO_ESCAPES_LIMIT = 8; // po koľkých "útekoch" už dovolí kliknúť na Nie

function setChoice(choice) {
  if (choice === "yes") {
    document.body.style.background = "#16a34a"; // zelená
    result.textContent = "Jupí! 💚";
  } else if (choice === "no") {
    document.body.style.background = "#f97316"; // oranžová
    result.textContent = "Okej 😅🧡";
  } else {
    // default
    document.body.style.background = "#111827";
    result.textContent = "";
  }

  localStorage.setItem(STORAGE_KEY, choice);
}

yesBtn.addEventListener("click", () => setChoice("yes"));

/* ---------------------------
   Utekajúce "Nie" (safe viewport)
---------------------------- */

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// pri prvom pohybe prepneme "Nie" na presné px pozicionovanie
let noInitialized = false;
function initNoButtonPosition() {
  if (noInitialized) return;

  const rect = noBtn.getBoundingClientRect();
  noBtn.style.transform = "none";
  noBtn.style.left = `${rect.left}px`;
  noBtn.style.top  = `${rect.top}px`;

  noInitialized = true;
}

let escapes = Number(localStorage.getItem("no_escapes_count") || "0");

function canStillEscape() {
  return escapes < NO_ESCAPES_LIMIT;
}

function moveNoButtonAway(fromX, fromY) {
  initNoButtonPosition();

  const rect = noBtn.getBoundingClientRect();
  const bx = rect.left + rect.width / 2;
  const by = rect.top  + rect.height / 2;

  let dx = bx - fromX;
  let dy = by - fromY;

  if (dx === 0 && dy === 0) {
    dx = Math.random() - 0.5;
    dy = Math.random() - 0.5;
  }

  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  const jump = 160;

  let newLeft = rect.left + dx * jump;
  let newTop  = rect.top  + dy * jump;

  const pad = 8;
  const minLeft = pad;
  const minTop  = pad;
  const maxLeft = window.innerWidth  - rect.width  - pad;
  const maxTop  = window.innerHeight - rect.height - pad;

  newLeft = clamp(newLeft, minLeft, maxLeft);
  newTop  = clamp(newTop,  minTop,  maxTop);

  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top  = `${newTop}px`;

  escapes += 1;
  localStorage.setItem("no_escapes_count", String(escapes));

  // po limite už prestane utekať (a dovolí kliknúť)
  if (!canStillEscape()) {
    noBtn.textContent = "Nie 🙈";
    noBtn.style.cursor = "pointer";
  }
}

// PC: uteká keď sa kurzor priblíži (kým má utekať)
document.addEventListener("mousemove", (e) => {
  if (!canStillEscape()) return;

  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

  if (dist < 120) moveNoButtonAway(e.clientX, e.clientY);
});

// Mobile: uteká pri pokuse o ťuknutie (kým má utekať)
noBtn.addEventListener("touchstart", (e) => {
  if (!canStillEscape()) return; // už môže kliknúť normálne

  e.preventDefault();
  const t = e.touches[0];
  moveNoButtonAway(t.clientX, t.clientY);
}, { passive: false });

// Kliknutie na Nie:
// - kým uteká: kliknutie zablokuje a nechá ho odskočiť
// - po limite: uloží "no" a nastaví oranžovú (aj po refreshi)
noBtn.addEventListener("click", (e) => {
  if (canStillEscape()) {
    e.preventDefault();
    moveNoButtonAway(window.innerWidth / 2, window.innerHeight / 2);
    return;
  }
  setChoice("no");
});

// pri resize (rotácia mobilu) udržať tlačidlo v obraze
window.addEventListener("resize", () => {
  if (!noInitialized) return;

  const rect = noBtn.getBoundingClientRect();
  const pad = 8;
  const maxLeft = window.innerWidth  - rect.width  - pad;
  const maxTop  = window.innerHeight - rect.height - pad;

  const safeLeft = clamp(rect.left, pad, maxLeft);
  const safeTop  = clamp(rect.top,  pad, maxTop);

  noBtn.style.left = `${safeLeft}px`;
  noBtn.style.top  = `${safeTop}px`;
});

/* ---------------------------
   Načítanie uloženého výsledku po refreshi
---------------------------- */
const saved = localStorage.getItem(STORAGE_KEY);
if (saved === "yes" || saved === "no") {
  setChoice(saved);
}

// ak už vyčerpal úteky v minulosti, tak nech už neuteká ani po refreshi
if (!canStillEscape()) {
  noBtn.textContent = "Nie 🙈";
}

