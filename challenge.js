const pages = document.querySelectorAll(".page");
let currentGame = "";

function openGame(id) {
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  currentGame = id;

  if (id === "memory") initMemory();
  if (id === "word") initWord();
  if (id === "maze") initMaze(); 
}

function goHome() {
  pages.forEach(p => p.classList.remove("active"));
  document.getElementById("mainMenu").classList.add("active");
}

function restartGame() {
  location.reload();
}

function showPopup(win) {
  const popup = document.getElementById("popup");
  const text = document.getElementById("popupText");

  popup.classList.remove("hidden");

  if (win) {
    text.innerText = "YOU WIN";
    document.getElementById("winSound").play();
    createConfetti();
  } else {
    text.innerText = "YOU LOSE";
    document.getElementById("loseSound").play();
    createThumbs();
  }

  setTimeout(() => {
    document.querySelectorAll(".confetti, .thumb").forEach(e => e.remove());
  }, 55000);
}

function createConfetti() {
  for (let i = 0; i < 100; i++) {
    let c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * window.innerWidth + "px";
    c.style.animationDuration = (Math.random() * 3 + 2) + "s";
    document.body.appendChild(c);
  }
}

function createThumbs() {
  for (let i = 0; i < 100; i++) {
    let t = document.createElement("div");
    t.className = "thumb";
    t.innerHTML = "👎";
    t.style.left = Math.random() * window.innerWidth + "px";
    t.style.animationDuration = (Math.random() * 3 + 2) + "s";
    document.body.appendChild(t);
  }
}

//////////////// MEMORY GAME //////////////////

const symbols = ["⭐","✝","🦋","$","🌳"];
let memoryCards = [];
let flipped = [];
let matches = 0;
let attempts = 0;

function initMemory() {
  const board = document.getElementById("memoryBoard");
  board.innerHTML = "";

  memoryCards = [...symbols, ...symbols]
    .sort(() => Math.random() - 0.5);

  memoryCards.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card hidden-card";
    card.innerText = symbol;

    card.onclick = () => flipCard(card, symbol);

    board.appendChild(card);
  });

  matches = 0;
  attempts = 0;
}

function flipCard(card, symbol) {
  if (flipped.length >= 2 || !card.classList.contains("hidden-card")) return;

  card.classList.remove("hidden-card");
  flipped.push({card, symbol});

  if (flipped.length === 2) {
    attempts++;
    document.getElementById("attempts").innerText =
      `Attempts: ${attempts} / 20`;

    if (flipped[0].symbol === flipped[1].symbol) {
      matches++;
      flipped = [];

      if (matches === 5) {
        showPopup(true);
      }
    } else {
      setTimeout(() => {
        flipped[0].card.classList.add("hidden-card");
        flipped[1].card.classList.add("hidden-card");
        flipped = [];
      }, 1000);
    }

    if (attempts >= 20 && matches < 5) {
      setTimeout(() => showPopup(false), 1000);
    }
  }
}

//////////////// MAZE GAME //////////////////

let playerCol = 0; 
let playerRow = 0; 


const mazeMap = [
  [0, 0, 1, 1, 1, 1, 1, 1, 1], 
  [1, 0, 1, 0, 0, 0, 0, 0, 1], 
  [1, 0, 1, 0, 1, 1, 1, 0, 1], 
  [1, 0, 0, 0, 1, 0, 0, 0, 1], 
  [1, 1, 1, 0, 1, 0, 1, 1, 1], 
  [1, 0, 0, 0, 0, 0, 0, 0, 1], 
  [1, 0, 1, 1, 1, 1, 1, 0, 1], 
  [1, 0, 0, 0, 0, 0, 0, 0, 0], 
  [1, 1, 1, 1, 1, 1, 1, 1, 2]  
];

function initMaze() {
  playerCol = 0;
  playerRow = 0;
  updatePlayerElement();
}

function movePlayer(dir) {
  let targetRow = playerRow;
  let targetCol = playerCol;

  if (dir === "up") targetRow -= 1;
  if (dir === "down") targetRow += 1;
  if (dir === "left") targetCol -= 1;
  if (dir === "right") targetCol += 1;


  if (targetRow < 0 || targetRow > 8 || targetCol < 0 || targetCol > 8) {
    return;
  }

 
  if (mazeMap[targetRow][targetCol] === 1) {
    return; 
  }

  playerRow = targetRow;
  playerCol = targetCol;
  updatePlayerElement();

 
  if (mazeMap[playerRow][playerCol] === 2) {
    setTimeout(() => showPopup(true), 150);
  }
}

function updatePlayerElement() {
  const player = document.getElementById("player");
  

  let leftPixels = (playerCol * 54) + 14;
  let topPixels = (playerRow * 54) + 14;

  player.style.left = leftPixels + "px";
  player.style.top = topPixels + "px";
}


//////////////// SIMON SAYS //////////////////

const simonBtns = document.querySelectorAll(".simon-btn");
const colors = ["red","blue","green","yellow","purple","orange","pink","cyan"];

let sequence = [];
let userSequence = [];

document.getElementById("startSimon").onclick = startSimon;

function startSimon() {
  sequence = [];
  userSequence = [];

  for (let i = 0; i < 5; i++) {
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
  }

  playSequence();
}

function playSequence() {
  sequence.forEach((color, index) => {
    setTimeout(() => {
      const btn = document.querySelector(`[data-color="${color}"]`);
      btn.classList.add("active");

      setTimeout(() => {
        btn.classList.remove("active");
      }, 500);

    }, index * 800);
  });
}

simonBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    userSequence.push(btn.dataset.color);

    if (userSequence.length === sequence.length) {
      if (JSON.stringify(userSequence) === JSON.stringify(sequence)) {
        showPopup(true);
      } else {
        showPopup(false);
      }
    }
  });
});

//////////////// WORD SCRAMBLE //////////////////

const words = [
  "computer",
  "elephant",
  "javascript",
  "mountain",
  "building"
];

let currentWord = "";

function initWord() {
  currentWord = words[Math.floor(Math.random() * words.length)];

  const scrambled = currentWord
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  document.getElementById("scrambledWord").innerText = scrambled;
}

function checkWord() {
  const input = document.getElementById("wordInput").value.toLowerCase();

  if (input === currentWord) {
    showPopup(true);
  } else {
    showPopup(false);
  }
}