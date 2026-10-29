
/* LUDO SULTAN — App Controller */
"use strict";

(function () {
  // ===== BOARD CATALOG =====
  const BOARDS = [
    { id: "forest-arena", name: "Forest Arena", entryFee: 10 },
    { id: "royal-palace", name: "Royal Palace", entryFee: 30 },
    { id: "magical-desert", name: "Magical Desert", entryFee: 50 },
    { id: "ice-kingdom", name: "Ice Kingdom", entryFee: 70 },
    { id: "lava-fortress", name: "Lava Fortress", entryFee: 100 },
    { id: "diamond-arena", name: "Diamond Arena", entryFee: 150 },
    { id: "fire-age", name: "Fire Age", entryFee: 250 },
    { id: "sultan-legends", name: "Sultan Legends", entryFee: 500 }
  ];

  // ===== SOUND FILES =====
  const sounds = {
    bg: new Audio("assets/sounds/lobby_background.mp3"),
    click: new Audio("assets/sounds/button_click.mp3"),
    dice: new Audio("assets/sounds/dice_roll.mp3"),
    six: new Audio("assets/sounds/dice_six.mp3"),
    win: new Audio("assets/sounds/game_win.mp3"),
    capture: new Audio("assets/sounds/token_capture.mp3"),
    move: new Audio("assets/sounds/token_move.mp3"),
    start: new Audio("assets/sounds/token_start.mp3"),
    buy: new Audio("assets/sounds/package_buy.mp3"),
    sell: new Audio("assets/sounds/package_sell.mp3")
  };

  sounds.bg.loop = true;
  sounds.bg.volume = 0.3;

  let musicStarted = false;
  let selectedBoardId = null;

  function playSound(name) {
    const sound = sounds[name];
    if (!sound) return;

    try {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch (_) {}
  }

  // Browser audio starts after the user's first interaction.
  document.addEventListener("click", function () {
    if (!musicStarted) {
      musicStarted = true;
      sounds.bg.play().catch(() => {});
    }
  }, { once: true });

  // ===== PUBLIC BOARD API =====
  window.LudoSultan = {
    getBoards: function () {
      return BOARDS.map(board => ({ ...board }));
    },

    getSelectedBoard: function () {
      return BOARDS.find(board => board.id === selectedBoardId) || null;
    },

    selectBoard: function (boardId) {
      const board = BOARDS.find(item => item.id === boardId);

      if (!board) {
        return { error: "Invalid board selected." };
      }

      selectedBoardId = board.id;
      playSound("click");

      document.dispatchEvent(new CustomEvent("ludosultan:boardSelected", {
        detail: { ...board }
      }));

      return { success: true, board: { ...board } };
    },

    playSound: playSound
  };

  // ===== GAME CONTROLLER =====
  function startApp() {
    if (!window.LudoGame) {
      console.error("LudoGame not found. Load game.js first.");
      return;
    }

    const die = document.getElementById("die");
    const turn = document.getElementById("turn");
    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

    function showState() {
      const state = window.LudoGame.getState();

      if (turn) {
        turn.textContent = state.gameOver
          ? state.winner + " wins!"
          : state.currentPlayer + " player's turn";
      }
    }

    // Existing Roll Dice button can call window.rollDice().
    window.rollDice = function () {
      playSound("click");

      const result = window.LudoGame.rollDice();

      if (result.error) {
        alert(result.error);
        return;
      }

      if (
        die &&
        Number.isInteger(result.dice) &&
        result.dice >= 1 &&
        result.dice <= 6
      ) {
        die.textContent = faces[result.dice - 1];
      }

      playSound(result.dice === 6 ? "six" : "dice");

      if (turn) {
        turn.textContent = result.player + " rolled " + result.dice;
      }

      if (result.mustPass) {
        alert("No legal move. Your turn will pass.");

        const passed = window.LudoGame.passTurn();

        if (passed && passed.error) {
          alert(passed.error);
        }

        showState();
        return;
      }

      if (!Array.isArray(result.legalMoves)) {
        alert("Game engine did not return legal moves.");
        return;
      }

      const choices = result.legalMoves
        .map(index => index + 1)
        .join(", ");

      if (!choices) {
        alert("No movable tokens were returned.");
        return;
      }

      const answer = prompt(
        "Player: " + result.player +
        "\nDice: " + result.dice +
        "\nMovable tokens: " + choices +
        "\nEnter a movable token number:"
      );

      if (answer === null) {
        alert("Move cancelled. Check the game before rolling again.");
        return;
      }

      const tokenNumber = Number(answer);

      if (
        !Number.isInteger(tokenNumber) ||
        tokenNumber < 1 ||
        tokenNumber > 4 ||
        !result.legalMoves.includes(tokenNumber - 1)
      ) {
        alert("Choose one of these tokens: " + choices);
        return;
      }

      const move = window.LudoGame.moveToken(tokenNumber - 1);

      if (move.error) {
        alert(move.error);
        return;
      }

      if (move.captured && move.captured.length > 0) {
        playSound("capture");
        alert("Captured " + move.captured.length + " opposing token(s)!");
      } else {
        playSound("move");
      }

      if (move.gameOver) {
        playSound("win");
        alert("🏆 " + move.winner + " wins!");
      }

      showState();
    };

    // Existing New Game button can call window.newGame().
    window.newGame = function () {
      playSound("click");

      if (typeof window.LudoGame.newGame !== "function") {
        alert("New Game is not available in game.js.");
        return;
      }

      window.LudoGame.newGame();

      if (die) {
        die.textContent = "⚄";
      }

      showState();
    };

    showState();
    console.log("LUDO SULTAN controller loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
})();
