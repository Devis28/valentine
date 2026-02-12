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

  // aby sa voľba držala aj po refreshi
  localStorage.setItem("valentine_choice", choice);
}

yesBtn.addEventListener("click", () => setChoice("yes"));
noBtn.addEventListener("click",  () => setChoice("no"));

// načítanie uloženého výsledku
const saved = localStorage.getItem("valentine_choice");
if (saved) setChoice(saved);
