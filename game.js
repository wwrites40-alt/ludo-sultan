// Ludo Sultan - Brand New Logic

let currentTurn = 0; // 0: Red, 1: Green, 2: Yellow, 3: Blue
const playerColors = ["red", "green", "yellow", "blue"];
let currentDiceValue = 0;

// گوٹیوں کا اسٹیٹ: -1 = گھر کے اندر، 0+ = بورڈ پر
const gameState = {
  red: [-1, -1, -1, -1],
  green: [-1, -1, -1, -1],
  yellow: [-1, -1, -1, -1],
  blue: [-1, -1, -1, -1]
};

// ہوم پوزیشنز
const homeCoords = {
  red: [{t:'15%',l:'15%'}, {t:'15%',l:'25%'}, {t:'25%',l:'15%'}, {t:'25%',l:'25%'}],
  green: [{t:'15%',r:'15%'}, {t:'15%',r:'25%'}, {t:'25%',r:'15%'}, {t:'25%',r:'25%'}],
  yellow: [{b:'15%',r:'15%'}, {b:'15%',r:'25%'}, {b:'25%',r:'15%'}, {b:'25%',r:'25%'}],
  blue: [{b:'15%',l:'15%'}, {b:'15%',l:'25%'}, {b:'25%',l:'15%'}, {b:'25%',l:'25%'}]
};

// سٹارٹنگ ہوم خانے
const startCoords = {
  red: { top: '38%', left: '22%' },
  green: { top: '22%', right: '38%' },
  yellow: { bottom: '38%', right: '22%' },
  blue: { bottom: '22%', left: '38%' }
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function startGameDirectly() {
  showScreen('home');
}

function enterGameRoom() {
  newGameReset();
  showScreen('arena');
}

function exitToHome() {
  showScreen('home');
}

function newGameReset() {
  currentTurn = 0;
  currentDiceValue = 0;
  
  playerColors.forEach(color => {
    gameState[color] = [-1, -1, -1, -1];
    for (let i = 0; i < 4; i++) {
      resetTokenToHome(color, i);
    }
  });

  updateTurnsUI();
}

function rollDiceNew(playerIndex) {
  if (playerIndex !== currentTurn) {
    alert("یہ آپ کی باری نہیں ہے!");
    return;
  }

  currentDiceValue = Math.floor(Math.random() * 6) + 1;
  const cube = document.getElementById(`cube-${playerIndex}`);
  
  let rotX = 0, rotY = 0;
  if (currentDiceValue === 1) { rotX = 0; rotY = 0; }
  else if (currentDiceValue === 2) { rotX = -90; rotY = 0; }
  else if (currentDiceValue === 3) { rotX = 0; rotY = -90; }
  else if (currentDiceValue === 4) { rotX = 0; rotY = 90; }
  else if (currentDiceValue === 5) { rotX = 90; rotY = 0; }
  else if (currentDiceValue === 6) { rotX = 0; rotY = 180; }

  cube.style.transform = `rotateX(${rotX + 720}deg) rotateY(${rotY + 720}deg)`;

  setTimeout(() => {
    const currentColor = playerColors[playerIndex];

    if (currentDiceValue === 6) {
      // 6 آنے پر آٹومیٹک گوٹی باہر نکالنا
      const closedTokenIndex = gameState[currentColor].findIndex(p => p === -1);
      if (closedTokenIndex !== -1) {
        gameState[currentColor][closedTokenIndex] = 0; // باہر آ گئی
        moveTokenToStartCell(currentColor, closedTokenIndex);
        alert(`🎉 ${currentColor.toUpperCase()} کو 6 ملا! گوٹی باہر آ گئی اور آپ کو ایک اور باری ملی ہے!`);
      } else {
        alert(`🎲 6 آیا! آگے چلنے کے لیے اپنی کسی گوٹی پر کلک کریں (آپ کو دوسری باری بھی ملے گی)۔`);
      }
      // 6 آنے پر باری تبدیل نہیں ہوگی (دوسری باری ملے گی)
    } else {
      alert(`🎲 ${currentColor.toUpperCase()} نے ${currentDiceValue} پھینکا!`);
      // اگلا کھلاڑی
      currentTurn = (currentTurn + 1) % 4;
    }
    
    updateTurnsUI();
  }, 800);
}

function clickToken(color, index) {
  if (playerColors[currentTurn] !== color) {
    alert("یہ آپ کی باری نہیں ہے!");
    return;
  }

  const currentPos = gameState[color][index];
  if (currentPos === -1) {
    alert("یہ گوٹی اندر ہے، باہر نکالنے کے لیے ڈائس پر 6 لائیں!");
    return;
  }

  // گوٹی کو آگے بڑھائیں
  gameState[color][index] += currentDiceValue;
  const tokenEl = document.getElementById(`${color}-${index}`);
  
  // بورڈ پر موومنٹ فیڈ بیک
  tokenEl.style.transform = "translate(-50%, -50%) scale(1.3)";
  setTimeout(() => {
    tokenEl.style.transform = "translate(-50%, -50%) scale(1)";
  }, 300);
}

function moveTokenToStartCell(color, tokenIndex) {
  const tokenEl = document.getElementById(`${color}-${tokenIndex}`);
  if (!tokenEl) return;

  const pos = startCoords[color];
  tokenEl.style.top = pos.top || 'auto';
  tokenEl.style.left = pos.left || 'auto';
  tokenEl.style.bottom = pos.bottom || 'auto';
  tokenEl.style.right = pos.right || 'auto';
}

function resetTokenToHome(color, tokenIndex) {
  const tokenEl = document.getElementById(`${color}-${tokenIndex}`);
  if (!tokenEl) return;

  const pos = homeCoords[color][tokenIndex];
  tokenEl.style.top = pos.t || 'auto';
  tokenEl.style.left = pos.l || 'auto';
  tokenEl.style.bottom = pos.b || 'auto';
  tokenEl.style.right = pos.r || 'auto';
}

function updateTurnsUI() {
  for (let i = 0; i < 4; i++) {
    const box = document.getElementById(`dice-box-${i}`);
    if (i === currentTurn) {
      box.classList.add('active-turn');
    } else {
      box.classList.remove('active-turn');
    }
  }

  const label = document.getElementById('turn');
  if (label) {
    label.innerText = `Turn: ${playerColors[currentTurn].toUpperCase()} (Roll 6 to open token)`;
  }
}
