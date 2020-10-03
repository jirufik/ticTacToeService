import Player from "../player/player";
import GameBoard from "../gameBoard/gameBoard";
import History from "../history/history";
import EventEmitter from "events";
import AI from "../ai/ai";
import randomInteger from "../../server/utils/randomInteger";

export default class Game extends EventEmitter {

  constructor({firstPlayer, secondPlayer, gameBoardSize = 3, history = [], revision = 0, id = null}) {

    super();

    this.firstPlayer = Player.createPlayer({playerObjectDb: firstPlayer});
    this.secondPlayer = Player.createPlayer({playerObjectDb: secondPlayer});

    this.gameOver = false;
    this.playerMoveId = null;
    this.winnerId = null;
    this.history = new History({moves: history});
    this.surrenderedPlayer = null;
    this.revision = revision;
    this.gameBoard = new GameBoard({size: gameBoardSize});
    this.gameSchema = null;
    this.ai = new AI({game: this});
    this.id = id;
    this.created = null;

    this.on('start', ({game}) => {
    });
    this.on('move', ({game}) => {
    });
    this.on('end', ({game}) => {
    });
    this.on('update', ({game}) => {
    });

  }

  static createNewGame({firstPlayer, secondPlayer, gameBoardSize = 3}) {
    const game = new Game({firstPlayer, secondPlayer, gameBoardSize});
    game.created = new Date();
    game.startGame();
    return game;
  }

  static loadGame({gameSchema}) {

    Game.validationGameSchema({gameSchema});

    gameSchema.id = String(gameSchema.id);
    const id = gameSchema.id;
    const firstPlayer = gameSchema.firstPlayer;
    const secondPlayer = gameSchema.secondPlayer;
    const gameOver = gameSchema.gameOver;
    const playerMoveId = gameSchema.playerMoveId;
    const winnerId = gameSchema.winnerId;
    const history = gameSchema.history;
    const surrenderedPlayer = gameSchema.surrenderedPlayer;
    const revision = gameSchema.revision;
    const gameBoardSchema = gameSchema.gameBoard;
    const created = new Date(gameSchema.created);

    const game = new Game({firstPlayer, secondPlayer, history, revision, id});

    game.gameOver = gameOver;
    game.playerMoveId = playerMoveId;
    game.winnerId = winnerId;
    game.surrenderedPlayer = surrenderedPlayer;
    game.gameBoard.loadGameBoard({gameBoardSchema});
    if (created) {
      game.created = created;
    }

    game.gameSchema = gameSchema;

    game.startGame();

    return game;

  }

  static validationGameSchema({gameSchema}) {

    if (!gameSchema.firstPlayer) {
      throw new Error('Wrong first player');
    }

    if (!gameSchema.secondPlayer) {
      throw new Error('Wrong second player');
    }

    if (!gameSchema.history) {
      throw new Error('Wrong history');
    }

    if (!gameSchema.gameBoard) {
      throw new Error('Wrong game board');
    }

  }

  startGame() {

    if (this.playerMoveId) return;

    this.emit('start', {game: this.gameSchema});

    const player = this._getRandomPlayer();
    const playerId = player.id;
    this.playerMoveId = playerId;
    if (!player.isAI) return;

    this.ai.aiPlayerId = this.playerMoveId;
    this.ai.enemyPlayerId = this.secondPlayer.id;
    this.makeMove({playerId, revision: this.revision});

  }

  _getRandomPlayer() {
    const players = [this.firstPlayer, this.secondPlayer];
    const number = randomInteger({min: 1, max: 2});
    return players[number - 1];
  }

  makeMove({playerId, numberOnGameBoard, revision}) {

    this._checkGameOver();
    this._checkRevision({revision});
    this._checkPlayerId({playerId});

    numberOnGameBoard = this._takeUpThePlayingAreaNumber({playerId, numberOnGameBoard});

    this.gameBoard.lines.updateStateLines();

    this.history.addMove({playerId, numberOnGameBoard});

    const isTie = this._isTie();
    const playerIsWin = this._playerIsWin({playerId});
    const isEndGame = isTie || playerIsWin;

    let event = 'move';

    if (isEndGame) {
      this.endGame();
      event = 'end';
    } else {
      this._setNextPlayer({playerId});
    }

    this.increaseRevision();

    const gameSchema = this.updateGameSchema();

    this.emit(event, {game: this.gameSchema});

    this._showGameInConsole();

    return gameSchema;

  }

  _checkGameOver() {
    if (this.gameOver) {
      throw new Error('The game is over');
    }
  }

  _checkRevision({revision}) {

    const badRevision = typeof revision !== 'number' || revision !== this.revision;
    if (badRevision) {
      throw new Error('Wrong revision');
    }

  }

  _checkPlayerId({playerId}) {

    const badRevision = !playerId || playerId !== this.playerMoveId;
    if (badRevision) {
      throw new Error('Wrong player id');
    }

  }

  _takeUpThePlayingAreaNumber({playerId, numberOnGameBoard}) {

    const isAI = this.playerIdIsAI({playerId});

    let playingArea = null;

    if (isAI) {
      playingArea = this.ai.getFreePlayingArea();
      numberOnGameBoard = playingArea.numberOnGameBoard;
    } else {
      playingArea = this.gameBoard.getPlayingAreaByNumberOnGameBoard({numberOnGameBoard});
    }

    playingArea.takeUpThePlayingArea({playerId});

    return numberOnGameBoard;

  }

  playerIdIsAI({playerId}) {

    const isFirstPlayerId = playerId === this.firstPlayer.id;
    const isAI = isFirstPlayerId ? this.firstPlayer.isAI : this.secondPlayer.isAI;

    return isAI;

  }

  _isTie() {
    return !this.gameBoard.lines.playerCanGo();
  }

  _playerIsWin({playerId}) {

    const playerIsWin = this.gameBoard.lines.playerIsWin({playerId});
    if (!playerIsWin) return;

    this.playerMoveId = null;
    this.winnerId = playerId;

    return true;

  }

  endGame() {
    this.gameOver = true;
    this.playerMoveId = null;
  }

  _setNextPlayer({playerId}) {

    const isFirstPlayerId = playerId === this.firstPlayer.id;
    const playerMoveId = isFirstPlayerId ? this.secondPlayer.id : this.firstPlayer.id;

    this.playerMoveId = playerMoveId;

  }

  increaseRevision() {
    this.revision += 1;
  }

  checkShouldGoAI() {

    if (this.gameOver) return;

    const playerId = this.playerMoveId;
    const isAi = this.playerIdIsAI({playerId});
    if (isAi) {
      this.makeMove({playerId, revision: this.revision});
    }

  }

  updateGameSchema() {

    const id = this.id;
    const firstPlayer = this.firstPlayer.savePlayer();
    const secondPlayer = this.secondPlayer.savePlayer();
    const gameOver = this.gameOver;
    const playerMoveId = this.playerMoveId;
    const winnerId = this.winnerId;
    const history = this.history.saveHistory();
    const surrenderedPlayer = this.surrenderedPlayer;
    const revision = this.revision;
    const gameBoard = this.gameBoard.saveGameBoard();
    const created = this.created;

    const gameSchema = {
      id,
      firstPlayer,
      secondPlayer,
      gameOver,
      playerMoveId,
      winnerId,
      history,
      surrenderedPlayer,
      revision,
      gameBoard,
      created
    }

    this.gameSchema = gameSchema;
    this.emit('update', {game: this.gameSchema});

    return gameSchema;

  }

  _showGameInConsole() {

    const size = this.gameBoard.size;
    const lines = this.gameBoard.lines.horizontal;
    let str = ``;

    for (const line of lines) {
      for (let i = 0; i < size; i++) {

        const playingArea = line.area[i];

        const isFree = !playingArea.borrowedPlayer;
        if (isFree) {
          str += ` `;
          continue;
        }

        const isX = playingArea.borrowedPlayer === this.firstPlayer.id;
        if (isX) {
          str += `X`;
          continue;
        }

        str += `O`;

      }
      str += `\n`;
    }

    console.log(str);

  }

}
