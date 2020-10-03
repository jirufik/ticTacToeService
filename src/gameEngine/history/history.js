export default class History {

  constructor({moves = []} = {}) {

    this.validMoves({moves});

    this.moves = moves;

  }

  addMove({playerId, numberOnGameBoard}) {

    this.validPlayerId({playerId});
    this.validPlayerNumberOnGameBoard({numberOnGameBoard});

    this.moves.push({playerId, numberOnGameBoard});

  }

  clearHistory() {
    this.moves = [];
  }

  deleteLastMove() {
    this.moves.pop();
  }

  saveHistory() {
    return this.moves;
  }

  validPlayerNumberOnGameBoard({numberOnGameBoard}) {
    if (!numberOnGameBoard) {
      throw new Error('Wrong number on game board');
    }
  }

  validPlayerId({playerId}) {
    if (!playerId) {
      throw new Error('Wrong player id');
    }
  }

  validMoves({moves}) {
    const badMoves = !Array.isArray(moves);
    if (badMoves) {
      throw new Error('Wrong history moves');
    }
  }

}
