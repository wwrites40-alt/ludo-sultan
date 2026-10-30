"use strict";

const LudoGame = (() => {
  const COLORS = ["Red", "Green", "Yellow", "Blue"];
  const START = [0, 13, 26, 39];
  const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const FINISH = 57;

  const BLOCKED_FOR_COLOR = {
    Red: (START[0] + 1) % 52,
    Green: (START[1] + 1) % 52,
    Yellow: (START[2] + 1) % 52,
    Blue: (START[3] + 1) % 52
  };

  let players, turn, dice, over, winner;

  function newGame() {
    players = COLORS.map((color, i) => ({
      color,
      start: START[i],
      tokens: [-1, -1, -1, -1]
    }));

    turn = 0;
    dice = 0;
    over = false;
    winner = null;

    return getState();
  }

  function square(playerIndex, progress) {
    if (progress < 0 || progress >= 52) return null;
    return (START[playerIndex] + progress) % 52;
  }

  function legalMoves() {
    if (!dice || over) return [];

    const player = players[turn];
    const blockedSquare = BLOCKED_FOR_COLOR[player.color];

    return player.tokens
      .map((position, index) => ({ position, index }))
      .filter(({ position }) => {
        if (position === -1) {
          return dice === 6;
        }

        const nextPosition = position + dice;
        if (nextPosition > FINISH) return false;

        if (nextPosition < 52) {
          const destination = square(turn, nextPosition);
          if (destination === blockedSquare) return false;
        }

        return true;
      })
      .map(({ index }) => index);
  }

  function rollDice() {
    if (over) return { error: "Game over. Start a new game." };
    if (dice !== 0) return { error: "Complete the current move first." };

    dice = Math.floor(Math.random() * 6) + 1;
    const moves = legalMoves();

    return {
      player: COLORS[turn],
      dice,
      legalMoves: moves,
      mustPass: moves.length === 0
    };
  }

  function passTurn() {
    if (!dice || legalMoves().length > 0) {
      return { error: "A legal move is available, or dice was not rolled." };
    }

    dice = 0;
    turn = (turn + 1) % 4;
    return getState();
  }

  function moveToken(tokenIndex) {
    if (over) return { error: "Game over." };
    if (!dice) return { error: "Roll the dice first." };

    if (!Number.isInteger(tokenIndex) || !legalMoves().includes(tokenIndex)) {
      return { error: "Invalid token move." };
    }

    const playerIndex = turn;
    const player = players[playerIndex];
    const oldPosition = player.tokens[tokenIndex];
    const rolledSix = dice === 6;

    const nextPosition = oldPosition === -1 ? 0 : oldPosition + dice;
    player.tokens[tokenIndex] = nextPosition;

    const captured = [];
    if (nextPosition < 52) {
      const landed = square(playerIndex, nextPosition);

      if (!SAFE.has(landed)) {
        players.forEach((other, otherIndex) => {
          if (otherIndex === playerIndex) return;

          other.tokens.forEach((position, token) => {
            if (position >= 0 && position < 52 && square(otherIndex, position) === landed) {
              captured.push({ player: other.color, token });
            }
          });
        });

        if (captured.length === 1) {
          const enemy = captured[0];
          players[COLORS.indexOf(enemy.player)].tokens[enemy.token] = -1;
        } else {
          captured.length = 0;
        }
      }
    }

    if (player.tokens.every(position => position === FINISH)) {
      over = true;
      winner = player.color;
    }

    const reachedFinish = nextPosition === FINISH;
    dice = 0;

    if (!over && !rolledSix && !reachedFinish) {
      turn = (turn + 1) % 4;
    }

    return {
      player: player.color,
      token: tokenIndex,
      position: nextPosition,
      captured,
      reachedFinish,
      gameOver: over,
      winner,
      nextPlayer: COLORS[turn],
      state: getState()
    };
  }

  function getState() {
    return {
      currentPlayer: COLORS[turn],
      diceValue: dice,
      gameOver: over,
      winner,
      players: JSON.parse(JSON.stringify(players)),
      legalMoves: legalMoves()
    };
  }

  newGame();

  return { newGame, rollDice, moveToken, passTurn, getState, legalMoves };
})();

// UI Controller & Bridge
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

function skipLoginDirect() {
  showScreen('home');
}

function submitAuth() {
  showScreen('home');
}

function toggleMenu() {
  const dropdown = document.getElementById('roomDropdown');
  if (dropdown) dropdown.classList.toggle('show');
}

function toggleShop() {
  const shop = document.getElementById('game-shop');
  if (shop) shop.style.display = shop.style.display === 'none' ? 'flex' : 'none';
}

function openRoomModal() {
  document.getElementById('room-modal').style.display = 'flex';
}

function closeRoomModal() {
  document.getElementById('room-modal').style.display = 'none';
}

function createPrivateRoom() {
  const code = Math.floor(100000 + Math.random() * 900000);
  document.getElementById('roomCodeInput').value = code;
  alert(`روم کامیابی سے بن گیا ہے! آپ کا کوڈ ہے: ${code}`);
}

function joinPrivateRoom() {
  const code = document.getElementById('roomCodeInput').value.trim();
  if (!code) {
    alert("براہ کرم روم کوڈ درج کریں!");
    return;
  }
  closeRoomModal();
  selectAndEnterBoard('forest-arena');
}

function openLeaderboard() {
  document.getElementById('leaderboard-modal').style.display = 'flex';
}

function closeLeaderboard() {
  document.getElementById('leaderboard-modal').style.display = 'none';
}

function openSpinWheel() {
  document.getElementById('spin-wheel-modal').style.display = 'flex';
}

function closeSpinWheel() {
  document.getElementById('spin-wheel-modal').style.display = 'none';
}

let soundEnabled = true;
function toggleAudio() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('audio-btn');
  if (btn) btn.innerText = soundEnabled ? "🔊 Sound" : "🔇 Muted";
}

function selectAndEnterBoard(boardId) {
  LudoGame.newGame();
  showScreen('arena');
  const board = document.getElementById('board');
  if (board) {
    board.className = '';
    board.classList.add(`theme-${boardId}`);
  }
  updateUIFromEngine();
}

function handleDiceClick(playerIndex) {
  const state = LudoGame.getState();
  const playerColors = ["Red", "Green", "Yellow", "Blue"];

  if (state.currentPlayer !== playerColors[playerIndex]) {
    alert("یہ آپ کی باری نہیں ہے!");
    return;
  }

  const res = LudoGame.rollDice();
  if (res.error) {
    alert(res.error);
    return;
  }

  let rollResult = res.dice;
  let cube = document.getElementById(`cube-${playerIndex}`);
  if (cube) {
    let rotX = 0, rotY = 0;
    if (rollResult === 1) { rotX = 0; rotY = 0; }
    else if (rollResult === 2) { rotX = -90; rotY = 0; }
    else if (rollResult === 3) { rotX = 0; rotY = -90; }
    else if (rollResult === 4) { rotX = 0; rotY = 90; }
    else if (rollResult === 5) { rotX = 90; rotY = 0; }
    else if (rollResult === 6) { rotX = 0; rotY = 180; }
    cube.style.transform = `rotateX(${rotX + 720}deg) rotateY(${rotY + 720}deg)`;
  }

  setTimeout(() => {
    if (res.mustPass) {
      alert(`🎲 ${res.player} رولڈ ${rollResult}: کوئی قانونی چال ممکن نہیں، باری پاس ہو رہی ہے!`);
      LudoGame.passTurn();
    } else {
      alert(`🎲 ${res.player} رولڈ ${rollResult}! چلنے کے لیے اپنی کوئی روشن گوٹی منتخب کریں۔`);
    }
    updateUIFromEngine();
  }, 800);
}

function handleTokenClick(colorName, tokenIndex) {
  const state = LudoGame.getState();
  if (state.currentPlayer !== colorName) {
    alert("یہ آپ کی باری یا گوٹی نہیں ہے!");
    return;
  }

  const res = LudoGame.moveToken(tokenIndex);
  if (res.error) {
    alert(res.error);
    return;
  }

  updateUIFromEngine();
  if (res.gameOver) {
    alert(`👑 CONGRATULATIONS! ${res.winner} WON THE MATCH! 🎉`);
  }
}

function updateUIFromEngine() {
  const state = LudoGame.getState();
  const playerColors = ["Red", "Green", "Yellow", "Blue"];

  // ٹرن اور ڈائس باکس ہائی لائٹ
  const boxes = document.querySelectorAll('.corner-dice-box');
  boxes.forEach((box, index) => {
    if (playerColors[index] === state.currentPlayer) {
      box.classList.add('active-turn');
    } else {
      box.classList.remove('active-turn');
    }
  });

  const turnLabel = document.getElementById('turn');
  if (turnLabel) {
    turnLabel.innerText = `Turn: ${state.currentPlayer} ${state.diceValue ? '(Dice: ' + state.diceValue + ')' : '(Roll Dice)'}`;
  }

  // گوٹیوں کی پوزیشنز اپڈیٹ کرنا
  state.players.forEach(p => {
    p.tokens.forEach((pos, idx) => {
      const el = document.getElementById(`${p.color.toLowerCase()}-${idx}`);
      if (!el) return;

      if (pos === -1) {
        // گھر کے اندر بیسی پوزیشن
        el.style.top = ''; el.style.left = ''; el.style.bottom = ''; el.style.right = '';
        // ابتدائی کوآرڈینیٹس واپس سیٹ کریں
      } else {
        // بورڈ پر پوزیشن (آسان نمائندگی)
        el.style.top = `${20 + (pos % 10) * 5}%`;
        el.style.left = `${20 + (idx * 6)}%`;
      }
    });
  });
}

let userCoins = 50000;
function spinWheel() {
  const rewards = [1000, 2500, 5000, 10000, 500];
  const won = rewards[Math.floor(Math.random() * rewards.length)];
  userCoins += won;
  document.getElementById('coins').innerText = userCoins.toLocaleString();
  document.getElementById('spin-result').innerText = `🎉 You Won ${won.toLocaleString()} Coins!`;
}

function sendEmoji(emoji) {
  alert(`Emoji Sent: ${emoji}`);
}

function triggerWinEffect() {
  alert("👑 CONGRATULATIONS! YOU WON THE MATCH! 🎉");
}

function leaveRoom() {
  showScreen('home');
}
