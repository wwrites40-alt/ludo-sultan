
"use strict";

const LudoGame = (() => {
  const COLORS = ["Red", "Green", "Yellow", "Blue"];
  const START = [0, 13, 26, 39];
  const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
  const FINISH = 57;

  // Each color has one square it cannot LAND on.
  // The other three colors may land on that square.
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
        // A token at home can leave only on a six.
        if (position === -1) {
          return dice === 6;
        }

        const nextPosition = position + dice;

        // Do not allow moving beyond the finish.
        if (nextPosition > FINISH) {
          return false;
        }

        // Apply the color-specific blocked square only
        // when landing on the shared 52-square track.
        if (nextPosition < 52) {
          const destination = square(turn, nextPosition);

          if (destination === blockedSquare) {
            return false;
          }
        }

        return true;
      })
      .map(({ index }) => index);
  }

  function rollDice() {
    if (over) {
      return { error: "Game over. Start a new game." };
    }

    if (dice !== 0) {
      return { error: "Complete the current move first." };
    }

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
      return {
        error: "A legal move is available, or dice was not rolled."
      };
    }

    dice = 0;
    turn = (turn + 1) % 4;

    return getState();
  }

  function moveToken(tokenIndex) {
    if (over) return { error: "Game over." };
    if (!dice) return { error: "Roll the dice first." };

    // Enforce every rule, including color-specific blocked squares.
    if (
      !Number.isInteger(tokenIndex) ||
      !legalMoves().includes(tokenIndex)
    ) {
      return { error: "Invalid token move." };
    }

    const playerIndex = turn;
    const player = players[playerIndex];
    const oldPosition = player.tokens[tokenIndex];
    const rolledSix = dice === 6;

    const nextPosition =
      oldPosition === -1 ? 0 : oldPosition + dice;

    player.tokens[tokenIndex] = nextPosition;

    const captured = [];

    // Capture opponents on the shared track.
    if (nextPosition < 52) {
      const landed = square(playerIndex, nextPosition);

      if (!SAFE.has(landed)) {
        players.forEach((other, otherIndex) => {
          if (otherIndex === playerIndex) return;

          other.tokens.forEach((position, token) => {
            if (
              position >= 0 &&
              position < 52 &&
              square(otherIndex, position) === landed
            ) {
              captured.push({
                player: other.color,
                token
              });
            }
          });
        });

        // Preserve the existing rule: capture only one opponent.
        if (captured.length === 1) {
          const enemy = captured[0];

          players[COLORS.indexOf(enemy.player)]
            .tokens[enemy.token] = -1;
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

    // Preserve the existing extra-turn rule.
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
