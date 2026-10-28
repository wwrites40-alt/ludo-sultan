
/* LUDO SULTAN — App Controller */
"use strict";

(function () {
  function startApp() {
    if (!window.LudoGame) {
      console.error("LudoGame not found. Load game.js first.");
      return;
    }

    const die = document.getElementById("die");
    const turn = document.getElementById("turn");

    const faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    let lastRoll = null;

    function showState() {
      const state = window.LudoGame.getState();

      if (turn) {
        turn.textContent = state.gameOver
          ? state.winner + " wins!"
          : state.currentPlayer + " player's turn";
      }
    }

    // Connect the existing Roll Dice button.
    window.rollDice = function () {
      const result = window.LudoGame.rollDice();

      if (result.error) {
        alert(result.error);
        return;
      }

      lastRoll = result;

      if (die) {
        die.textContent = faces[result.dice - 1];
      }

      if (turn) {
        turn.textContent =
          result.player + " rolled " + result.dice;
      }

      if (result.mustPass) {
        alert("No legal move. Your turn will pass.");
        const passed = window.LudoGame.passTurn();

        if (passed.error) {
          alert(passed.error);
        }

        lastRoll = null;
        showState();
        return;
      }

      const choices = result.legalMoves
        .map(index => index + 1)
        .join(", ");

      const answer = prompt(
        "Player: " + result.player +
        "\nDice: " + result.dice +
        "\nMovable tokens: " + choices +
        "\nEnter token number (1 to 4):"
      );

      if (answer === null) {
        alert("Choose a token to complete this move.");
        return;
      }

      const tokenNumber = Number(answer);

      if (!Number.isInteger(tokenNumber) ||
          tokenNumber < 1 || tokenNumber > 4) {
        alert("Enter a token number from 1 to 4.");
        return;
      }

      const move = window.LudoGame.moveToken(tokenNumber - 1);

      if (move.error) {
        alert(move.error);
        return;
      }

      lastRoll = null;

      if (move.captured && move.captured.length) {
        alert("Captured " + move.captured.length +
          " opposing token(s)!");
      }

      if (move.gameOver) {
        alert("🏆 " + move.winner + " wins!");
      }

      showState();
    };

    // Connect the existing New Game button.
    window.newGame = function () {
      window.LudoGame.newGame();
      lastRoll = null;

      if (die) {
        die.textContent = "⚄";
      }

      showState();
    };

    showState();
    console.log("LUDO SULTAN app controller loaded.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp);
  } else {
    startApp();
  }
})();
