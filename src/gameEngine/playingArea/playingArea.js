export default class PlayingArea {

  constructor({numberOnGameBoard, borrowedPlayer = null}) {

    if (!numberOnGameBoard) {
      throw new Error('The number is not listed on the game board');
    }

    this.numberOnGameBoard = numberOnGameBoard;
    this.borrowedPlayer = borrowedPlayer;

  }

  takeUpThePlayingArea({playerId}) {

    if (!playerId) {
      throw new Error('No player listed');
    }

    if (this.borrowedPlayer) {
      throw new Error('The playing area is already occupied by another player');
    }

    this.borrowedPlayer = playerId;

  }

  freeUpPlayingArea() {
    this.borrowedPlayer = null;
  }

  saveArea() {
    return {
      borrowedPlayer: this.borrowedPlayer,
      numberOnGameBoard: this.numberOnGameBoard
    }
  }

}
