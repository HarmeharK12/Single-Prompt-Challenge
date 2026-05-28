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

const GRID_SIZE = 9; 
let playerCol = 0; 
let playerRow = 0; 
let mazeMap = []; 
function initMaze() {
  generateProceduralMaze();
  renderMazeHTML();
  
  playerCol = 0;
  playerRow = 0;
  updatePlayerElement();
}


function generateProceduralMaze() {

  mazeMap = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(1));

 
  let visited = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));
  let stack = [];

  
  let current = { r: 0, c: 0 };
  visited[current.r][current.c] = true;
  mazeMap[current.r][current.c] = 0;

  let moves = 0;
  const maxMoves = 300; 

  while (moves < maxMoves) {
    let neighbors = [];
    

    const directions = [
      { r: -2, c: 0, wallR: -1, wallC: 0 }, 
      { r: 2, c: 0, wallR: 1, wallC: 0 },   
      { r: 0, c: -2, wallR: 0, wallC: -1 }, 
      { r: 0, c: 2, wallR: 0, wallC: 1 }    
    ];

    directions.forEach(d => {
      let nr = current.r + d.r;
      let nc = current.c + d.c;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE && !visited[nr][nc]) {
        neighbors.push({ r: nr, c: nc, wallR: current.r + d.wallR, wallC: current.c + d.wallC });
      }
    });

    if (neighbors.length > 0) {
     
      let next = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      
      mazeMap[next.wallR][next.wallC] = 0;
      mazeMap[next.r][next.c] = 0;
      
      visited[next.r][next.c] = true;
      stack.push(current);
      current = { r: next.r, c: next.c };
    } else if (stack.length > 0) {
      current = stack.pop(); 
    } else {
      break; 
    }
    moves++;
  }

  
  mazeMap[0][0] = 0;
  mazeMap[0][1] = 0;
  mazeMap[1][0] = 0;
  mazeMap[GRID_SIZE - 1][GRID_SIZE - 2] = 0;
  mazeMap[GRID_SIZE - 2][GRID_SIZE - 1] = 0;

 
  mazeMap[GRID_SIZE - 1][GRID_SIZE - 1] = 2;
}


function renderMazeHTML() {
  const container = document.getElementById("mazeContainer");
  

  const player = document.getElementById("player");
  container.innerHTML = "";
  container.appendChild(player);

  
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement("div");
      
      if (mazeMap[r][c] === 1) {
        cell.className = "cell wall";
        cell.innerHTML = '<div class="top"></div><div class="front"></div><div class="right-side"></div>';
      } else if (r === 0 && c === 0) {
        cell.className = "cell start-zone";
        cell.innerHTML = '<span class="maze-label">START</span>';
      } else if (mazeMap[r][c] === 2) {
        cell.className = "cell end-zone";
        cell.innerHTML = '<span class="maze-label">END</span>';
      } else {
        cell.className = "cell path";
      }
      
      container.appendChild(cell);
    }
  }
}

function movePlayer(dir) {
  let targetRow = playerRow;
  let targetCol = playerCol;

  if (dir === "up") targetRow -= 1;
  if (dir === "down") targetRow += 1;
  if (dir === "left") targetCol -= 1;
  if (dir === "right") targetCol += 1;

  
  if (targetRow < 0 || targetRow >= GRID_SIZE || targetCol < 0 || targetCol >= GRID_SIZE) {
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

document.addEventListener("keydown", (event) => {
  if (currentGame !== "maze") return;

  if (event.key === "ArrowUp")    movePlayer("up");
  if (event.key === "ArrowDown")  movePlayer("down");
  if (event.key === "ArrowLeft")  movePlayer("left");
  if (event.key === "ArrowRight") movePlayer("right");
});
