const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const result = document.getElementById("result");

function setChoice(choice) {
  if (choice === "yes") {
    document.body.style.background = "#16a34a"; // zelená
    result.textContent = "Jupí! 💚";
  } else {
    document.body.style.background = "#f97316"; // oranžová
    result.textContent = "Okej 😅🧡";
  }
  localStorage.setItem("valentine_choice", choice);
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

  // nastavíme ho presne tam, kde aktuálne je (v px)
  noBtn.style.transform = "none";
  noBtn.style.left = `${rect.left}px`;
  noBtn.style.top  = `${rect.top}px`;

  noInitialized = true;
}

function moveNoButtonAway(fromX, fromY) {
  initNoButtonPosition();

  const rect = noBtn.getBoundingClientRect();
  const bx = rect.left + rect.width / 2;
  const by = rect.top  + rect.height / 2;

  // smer preč od kurzora / touch
  let dx = bx - fromX;
  let dy = by - fromY;

  // ak je presne na bode, vyber náhodný smer
  if (dx === 0 && dy === 0) {
    dx = Math.random() - 0.5;
    dy = Math.random() - 0.5;
  }

  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  const jump = 160; // ako ďaleko odskočí (px)

  let newLeft = rect.left + dx * jump;
  let newTop  = rect.top  + dy * jump;

  // hranice aby bolo celé tlačidlo viditeľné
  const pad = 8;
  const minLeft = pad;
  const minTop  = pad;
  const maxLeft = window.innerWidth  - rect.width  - pad;
  const maxTop  = window.innerHeight - rect.height - pad;

  newLeft = clamp(newLeft, minLeft, maxLeft);
  newTop  = clamp(newTop,  minTop,  maxTop);

  noBtn.style.left = `${newLeft}px`;
  noBtn.style.top  = `${newTop}px`;
}

// PC: uteká keď sa kurzor priblíži
document.addEventListener("mousemove", (e) => {
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

  if (dist < 120) moveNoButtonAway(e.clientX, e.clientY);
});

// Mobile: uteká pri pokuse o ťuknutie
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // zabráni reálnemu kliknutiu
  const t = e.touches[0];
  moveNoButtonAway(t.clientX, t.clientY);
}, { passive: false });

// Pre istotu: aj pri kliknutí nech utečie
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButtonAway(window.innerWidth / 2, window.innerHeight / 2);
});

// keď sa zmení veľkosť okna (rotácia mobilu), udržať tlačidlo v obraze
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
   Načítanie uloženého výsledku
---------------------------- */
const saved = localStorage.getItem("valentine_choice");
if (saved) setChoice(saved);
