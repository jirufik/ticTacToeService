import PlayingArea from "../playingArea/playingArea";
import Lines from "../lines/lines";

export default class GameBoard {

  constructor({size = 3} = {}) {

    const badSize = !size || size < 3;
    if (badSize) {
      throw new Error('Wrong game board size');
    }

    this.size = size;
    this.area = [];
    this.lines = new Lines();

    this.initGameBoard();
    this.initLines();

  }

  getPlayingAreaByNumberOnGameBoard({numberOnGameBoard}) {

    this.validationNumberOnGameBoard({numberOnGameBoard});

    const indexPlayingArea = numberOnGameBoard - 1;
    const playingArea = this.area[indexPlayingArea];

    return playingArea;

  }

  resetGameBoard() {

    this.area = [];
    this.lines = {
      horizontal: [],
      vertical: [],
      diagonal: [],
      reverseDiagonal: []
    };

  }

  initGameBoard() {

    this.validationSize();

    const gameBoardPlayingAreas = this.getFullSize();
    for (let numberOnGameBoard = 1; numberOnGameBoard <= gameBoardPlayingAreas; numberOnGameBoard++) {
      const playingArea = new PlayingArea({numberOnGameBoard});
      this.area.push(playingArea);
    }

  }

  initLines() {

    this.lines.init({
      area: this.area,
      size: this.size
    });

  }

  getFullSize() {
    this.validationSize();
    return Math.pow(this.size, 2);
  }

  saveGameBoard() {

    const size = this.size;

    const area = [];
    for (const playingArea of this.area) {
      area.push(playingArea.saveArea());
    }

    const gameBoardSchema = {
      size,
      area
    };

    return gameBoardSchema;

  }

  loadGameBoard({gameBoardSchema}) {

    this.validationGameBoardSchema({gameBoardSchema});

    this.size = gameBoardSchema.size;
    this.area = [];

    for (const playingAreaSchema of gameBoardSchema.area) {

      const borrowedPlayer = playingAreaSchema.borrowedPlayer;
      const numberOnGameBoard = playingAreaSchema.numberOnGameBoard;
      const playingArea = new PlayingArea({borrowedPlayer, numberOnGameBoard});

      this.area.push(playingArea);

    }

    this.initLines();

  }

  validationSize() {

    const badSize = !this.size || this.size < 3;
    if (badSize) {
      throw new Error('Wrong game board size');
    }

  }

  validationNumberOnGameBoard({numberOnGameBoard}) {

    const badNumberOnGameBoard = !numberOnGameBoard || numberOnGameBoard < 0 || numberOnGameBoard > this.area.length;
    if (badNumberOnGameBoard) {
      throw new Error('Wrong numberOnGameBoard');
    }

  }

  validationGameBoardSchema({gameBoardSchema}) {

    if (!gameBoardSchema.size) {
      throw new Error('Wrong game board size');
    }

    const badArea = !Array.isArray(gameBoardSchema.area);
    if (badArea) {
      throw new Error('Wrong game board area');
    }

  }

}
