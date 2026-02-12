const yesBtn = document.getElementById("yesBtn");
const noBtn  = document.getElementById("noBtn");
const result = document.getElementById("result");

function setChoice(choice) {
  if (choice === "yes") {
    document.body.style.background = "#16a34a";
    result.textContent = "Jupí! 💚";
  } else {
    document.body.style.background = "#f97316";
    result.textContent = "Okej 😅🧡";
  }
  localStorage.setItem("valentine_choice", choice);
}

yesBtn.addEventListener("click", () => setChoice("yes"));

// --- Utekajúce "Nie" ---

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function moveNoButtonAway(fromX, fromY) {
  const rect = noBtn.getBoundingClientRect();

  // aktuálny stred tlačidla
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  // smer "od" kurzora/ťuku
  let dx = cx - fromX;
  let dy = cy - fromY;

  // keď je presne na bode, daj náhodný smer
  if (dx === 0 && dy === 0) {
    dx = (Math.random() - 0.5);
    dy = (Math.random() - 0.5);
  }

  // normalizácia
  const len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  // ako ďaleko odskočí (prispôsob podľa chuti)
  const jump = Math.min(window.innerWidth, window.innerHeight) * 0.25;

  let newX = cx + dx * jump;
  let newY = cy + dy * jump;

  // udržať v rámci obrazovky
  const pad = 12;
  newX = clamp(newX, rect.width / 2 + pad, window.innerWidth  - rect.width / 2 - pad);
  newY = clamp(newY, rect.height/ 2 + pad, window.innerHeight - rect.height/ 2 - pad);

  noBtn.style.left = `${newX}px`;
  noBtn.style.top  = `${newY}px`;
  noBtn.style.transform = "translate(-50%, -50%)";
}

// PC: keď sa kurzor priblíži
document.addEventListener("mousemove", (e) => {
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

  // prah vzdialenosti, kedy začne utekať
  if (dist < 120) {
    moveNoButtonAway(e.clientX, e.clientY);
  }
});

// Mobile: keď sa ho pokúsi ťuknúť
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault(); // aby sa nekliklo
  const t = e.touches[0];
  moveNoButtonAway(t.clientX, t.clientY);
}, { passive: false });

// Aj keby niekto klikol (napr. cez keyboard), nech radšej utečie 😄
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  moveNoButtonAway(window.innerWidth / 2, window.innerHeight / 2);
});

// uložený výsledok po refreshi
const saved = localStorage.getItem("valentine_choice");
if (saved) setChoice(saved);
