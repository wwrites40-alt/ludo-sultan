
"use strict";

const LudoGame = (() => {
  const COLORS = ["Red", "Green", "Yellow", "Blue"];
  const START = [0, 13, 26, 39];
  const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
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
      .map((position, index) => ({ position, index }))
      .filter(({ position }) => {
        if (position === -1) return dice === 6;
        return position + dice <= FINISH;
      })
      .map(({ index }) => index);
  }

  function rollDice() {
    if (over) return { error: "Game over. Start a new game." };
    if (dice !== 0) return { error: "Move a token first." };

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
    if (!legalMoves().includes(tokenIndex)) {
      return { error: "Invalid token move." };
    }

    const playerIndex = turn;
    const player = players[playerIndex];
    const oldPosition = player.tokens[tokenIndex];
    const nextPosition = oldPosition === -1 ? 0 : oldPosition + dice;

    player.tokens[tokenIndex] = nextPosition;
    const captured = [];

    if (nextPosition < 52) {
      const landed = square(playerIndex, nextPosition);

      if (!SAFE.has(landed)) {
        players.forEach((other, otherIndex) => {
          if (otherIndex === playerIndex) return;

          other.tokens.forEach((position, token) => {
            if (position >= 0 && position < 52 &&
                square(otherIndex, position) === landed) {
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

    const rolledSix = dice === 6;
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

if (typeof window !== "undefined") {
  window.LudoGame = LudoGame;
}
