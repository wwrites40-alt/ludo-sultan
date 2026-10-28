/* LUDO SULTAN - Game Logic */
"use strict";

const LudoGame = (() => {
  const COLORS = ["Red", "Green", "Yellow", "Blue"];
  const START = [0, 13, 26, 39];
  const SAFE = [0, 8, 13, 21, 26, 34, 39, 47];
  const FINISH = 57;

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

  function square(player, progress) {
    if (progress < 0 || progress >= 52) return null;
    return (START[player] + progress) % 52;
  }

  function legalMoves() {
    if (!dice || over) return [];
    return players[turn].tokens
      .map((p, i) => ({ p, i }))
      .filter(({p}) => p === -1 ? dice === 6 :
        p < FINISH && p + dice <= FINISH)
      .map(({i}) => i);
  }

  function rollDice() {
    if (over) return { error: "Game over. Start a new game." };
    if (dice) return { error: "Move a token first." };

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
    if (!dice || legalMoves().length) {
      return { error: "Cannot pass this turn." };
    }

    const six = dice === 6;
    dice = 0;
    if (!six) turn = (turn + 1) % 4;
    return getState();
  }

  function moveToken(tokenIndex) {
    if (over) return { error: "Game over." };
    if (!dice) return { error: "Roll the dice first." };
    if (!legalMoves().includes(tokenIndex)) {
      return { error: "Invalid token move." };
    }

    const pi = turn;
    const player = players[pi];
    const old = player.tokens[tokenIndex];
    const next = old === -1 ? 0 : old + dice;

    player.tokens[tokenIndex] = next;
    const captured = [];

    if (next < 52) {
      const landed = square(pi, next);

      if (!SAFE.includes(landed)) {
        const enemies = [];

        players.forEach((other, oi) => {
          if (oi === pi) return;
          other.tokens.forEach((pos, ti) => {
            if (pos >= 0 && pos < 52 &&
                square(oi, pos) === landed) {
              enemies.push({ player: oi, token: ti });
            }
          });
        });

        // Capture a lone enemy token, not a group.
        if (enemies.length === 1) {
          const enemy = enemies[0];
          players[enemy.player].tokens[enemy.token] = -1;
          captured.push({
            player: COLORS[enemy.player],
            token: enemy.token
          });
        }
      }
    }

    if (player.tokens.every(p => p === FINISH)) {
      over = true;
      winner = player.color;
    }

    const rolledSix = dice === 6;
    const reachedFinish = next === FINISH;
    dice = 0;

    if (!over && !rolledSix && !reachedFinish) {
      turn = (turn + 1) % 4;
    }

    return {
      player: player.color,
      token: tokenIndex,
      position: next,
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

  return {
    newGame,
    rollDice,
    moveToken,
    passTurn,
    getState,
    legalMoves
  };
})();

if (typeof window !== "undefined") {
  window.LudoGame = LudoGame;
}
