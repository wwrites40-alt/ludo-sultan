"use strict";

const Controller = (() => {
  // 15x15 بورڈ کے خانے اور بیسز کی پوزیشن کا نقشہ
  const BOARD_MAP = {
    // Red Base Cells (0,0 to 5,5)
    redBase: [
      [1, 1], [1, 4], [4, 1], [4, 4]
    ],
    // Green Base Cells (0,9 to 5,14)
    greenBase: [
      [1, 10], [1, 13], [4, 10], [4, 13]
    ],
    // Yellow Base Cells (9,9 to 14,14)
    yellowBase: [
      [10, 10], [10, 13], [13, 10], [13, 13]
    ],
    // Blue Base Cells (9,0 to 14,5)
    blueBase: [
      [10, 1], [10, 4], [13, 1], [13, 4]
    ]
  };

  // 52 خانوں کا مرکزی راستہ (Shared Track Grid Coords [row, col])
  const TRACK_PATH = [
    [6,1], [6,2], [6,3], [6,4], [6,5],
    [5,6], [4,6], [3,6], [2,6], [1,6], [0,6],
    [0,7], [0,8],
    [1,8], [2,8], [3,8], [4,8], [5,8],
    [6,9], [6,10], [6,11], [6,12], [6,13], [6,14],
    [7,14], [8,14],
    [8,13], [8,12], [8,11], [8,10], [8,9],
    [9,8], [10,8], [11,8], [12,8], [13,8], [14,8],
    [14,7], [14,6],
    [13,6], [12,6], [11,6], [10,6], [9,6],
    [8,5], [8,4], [8,3], [8,2], [8,1], [8,0],
    [7,0], [6,0]
  ];

  let currentBoardTheme = 'forest-arena';

  // 1. فینسی بورڈ کا گریڈ (15x15 DOM Elements) بنانا
  function renderFancyBoard() {
    const board = document.getElementById('board');
    if (!board) return;

    board.innerHTML = ''; // پرانا بورڈ صاف کریں

    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        // ریڈ بیس (اوپر بائیں)
        if (row < 6 && col < 6) {
          cell.classList.add('base-area', 'red-base');
        } 
        // گرین بیس (اوپر دائیں)
        else if (row < 6 && col > 8) {
          cell.classList.add('base-area', 'green-base');
        } 
        // یلو بیس (نیچے دائیں)
        else if (row > 8 && col > 8) {
          cell.classList.add('base-area', 'yellow-base');
        } 
        // بلو بیس (نیچے بائیں)
        else if (row > 8 && col < 6) {
          cell.classList.add('base-area', 'blue-base');
        } 
        // ہوم / سنٹر (مرکز)
        else if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
          cell.classList.add('center-home');
        } 
        // عام راستہ (Track)
        else {
          cell.classList.add('track-cell');
          
          // ہوم کے راستے (Colored Home Paths)
          if (row === 7 && col >= 1 && col <= 5) cell.classList.add('path-red');
          if (col === 7 && row >= 1 && row <= 5) cell.classList.add('path-green');
          if (row === 7 && col >= 9 && col <= 13) cell.classList.add('path-yellow');
          if (col === 7 && row >= 9 && row <= 13) cell.classList.add('path-blue');

          // محفوظ خانے (Star / Safe Spots)
          if ((row === 6 && col === 1) || (row === 2 && col === 6) ||
              (row === 1 && col === 8) || (row === 6 && col === 12) ||
              (row === 8 && col === 13) || (row === 12 && col === 8) ||
              (row === 13 && col === 6) || (row === 8 && col === 2)) {
            cell.classList.add('safe-spot');
          }
        }

        board.appendChild(cell);
      }
    }

    updateTokensOnBoard();
  }

  // 2. گوٹیوں (Pawns/Tokens) کو بورڈ پر صحیح پوزیشن میں دکھانا
  function updateTokensOnBoard() {
    if (!window.LudoGame) return;

    // پرانی تمام گوٹیاں ہٹائیں
    document.querySelectorAll('.token').forEach(el => el.remove());

    const gameState = window.LudoGame.getState();
    const colors = ["Red", "Green", "Yellow", "Blue"];

    gameState.players.forEach((player, pIdx) => {
      const colorName = colors[pIdx].toLowerCase();

      player.tokens.forEach((pos, tIdx) => {
        let targetRow, targetCol;

        // اگر گوٹی بیس میں ہے
        if (pos === -1) {
          const baseCoords = BOARD_MAP[`${colorName}Base`][tIdx];
          targetRow = baseCoords[0];
          targetCol = baseCoords[1];
        } 
        // اگر گوٹی راستے پر چل رہی ہے
        else if (pos >= 0 && pos < 52) {
          const actualTrackIndex = (player.start + pos) % 52;
          const coords = TRACK_PATH[actualTrackIndex];
          targetRow = coords[0];
          targetCol = coords[1];
        }

        if (targetRow !== undefined && targetCol !== undefined) {
          const cell = document.querySelector(`.cell[data-row="${targetRow}"][data-col="${targetCol}"]`);
          if (cell) {
            const tokenEl = document.createElement('div');
            tokenEl.className = `token token-${colorName}`;
            tokenEl.innerText = tIdx + 1;
            tokenEl.onclick = () => onTokenClick(tIdx);
            cell.appendChild(tokenEl);
          }
        }
      });
    });

    // موڑ (Turn) اپ ڈیٹ کریں
    const turnEl = document.getElementById('turn');
    if (turnEl) {
      turnEl.innerText = `Turn: ${gameState.currentPlayer}`;
      turnEl.style.color = getPlayerColorCode(gameState.currentPlayer);
    }
  }

  // 3. گوٹی پر کلک کرنے پر حرکت دینا
  function onTokenClick(tokenIndex) {
    if (!window.LudoGame) return;

    const result = window.LudoGame.moveToken(tokenIndex);
    if (result.error) {
      console.warn(result.error);
    } else {
      updateTokensOnBoard();
      // ڈائس ویلیو دوبارہ ری سیٹ کریں
      const dieEl = document.getElementById('die');
      if (dieEl && result.diceValue === 0) {
        dieEl.innerText = '⚄';
      }
    }
  }

  // 4. ڈائس رول (چھکا / پاسا پھینکنا)
  function handleRollDice() {
    if (!window.LudoGame) return;

    const result = window.LudoGame.rollDice();
    if (result.error) {
      console.warn(result.error);
      return;
    }

    const dieEl = document.getElementById('die');
    const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    
    if (dieEl) {
      dieEl.innerText = diceIcons[result.dice - 1];
    }

    // اگر کوئی جائز چال نہیں ہے تو باری پاس کر دیں
    if (result.mustPass) {
      setTimeout(() => {
        window.LudoGame.passTurn();
        updateTokensOnBoard();
        if (dieEl) dieEl.innerText = '⚄';
      }, 1000);
    } else {
      updateTokensOnBoard();
    }
  }

  function getPlayerColorCode(color) {
    switch(color) {
      case 'Red': return '#e95a58';
      case 'Green': return '#49b87c';
      case 'Yellow': return '#f4d14b';
      case 'Blue': return '#55a4ee';
      default: return '#fff';
    }
  }

  function selectBoard(boardTheme) {
    currentBoardTheme = boardTheme;
    renderFancyBoard();
  }

  return {
    renderFancyBoard,
    updateTokensOnBoard,
    handleRollDice,
    selectBoard
  };
})();

// گلوبل ایکسیل ملانے کے لیے
if (typeof window !== "undefined") {
  window.LudoSultan = Controller;
  
  // ڈائس اور ری اسٹارٹ کے ڈائریکٹ فنکشنز
  window.rollDice = () => Controller.handleRollDice();
  window.newGame = () => {
    if (window.LudoGame) {
      window.LudoGame.newGame();
      Controller.updateTokensOnBoard();
    }
  };
}
