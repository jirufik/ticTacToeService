import pathExists from 'jrf-path-exists';
import GamesModel from "../model/model";
import {ObjectId} from 'mongodb';
import PlayersController from "../../players/controller/controller";
import Game from "../../../gameEngine/game/game";

const gameManager = require('../../../gameManager/gameManager');
const players = new PlayersController;

export default class GamesController {

  constructor() {

    this.games = new GamesModel();

  }

  async add({firstPlayerId, secondPlayerId, gameBoardSize}) {

    gameBoardSize = gameBoardSize || 3;

    this._validationPlayer(firstPlayerId);
    this._validationPlayer(secondPlayerId);
    this._validationGameBoardSize(gameBoardSize);

    const samePlayer = firstPlayerId === secondPlayerId;
    if (samePlayer) {
      throw new Error(`Wrong the player can't play against himself`);
    }

    const firstPlayer = await players.getByPlayerId({playerId: firstPlayerId});
    const secondPlayer = await players.getByPlayerId({playerId: secondPlayerId});

    const game = Game.createNewGame({firstPlayer, secondPlayer, gameBoardSize});
    const gameObjectDb = game.updateGameSchema();

    const newGame = await this.games.add({gameObjectDb});

    game.id = gameObjectDb.id;
    gameManager.addGame({game});
    this._addEventHandlers({game});

    return newGame;

  }

  async get({offset = 0, limit = 0} = {}) {

    offset = Number(offset);
    limit = Number(limit);

    const games = await this.games.get({skip: offset, limit});

    return games;

  }

  async getByGameId({gameId}) {

    this._validationGameId(gameId);

    const game = gameManager.getGameById({gameId});
    if (game) {
      const res = game.gameSchema;
      return res;
    }

    let gameSchema = await this._getGameSchemaById({gameId});

    if (!gameSchema.gameOver) {
      const game = this._loadGame({gameSchema});
      gameSchema = game.updateGameSchema();
    }

    return gameSchema;

  }

  async makeMove({gameId, playerId, numberOnGameBoard, revision}) {

    this._validationGameId(gameId);

    numberOnGameBoard = Number(numberOnGameBoard);
    revision = Number(revision);

    let game = gameManager.getGameById({gameId});

    if (!game) {
      const gameSchema = await this._getGameSchemaById({gameId});
      this._checkGameOver({gameSchema});
      game = this._loadGame({gameSchema});
    }

    const gameSchema = game.makeMove({playerId, numberOnGameBoard, revision});
    game.checkShouldGoAI();

    return gameSchema;

  }

  async _getGameSchemaById({gameId}) {

    gameId = ObjectId(gameId);
    const loadGame = await this.games.get({gameId});
    const gameSchema = pathExists(loadGame, '[0]');

    return gameSchema;

  }

  _loadGame({gameSchema}) {

    const game = Game.loadGame({gameSchema});
    gameManager.addGame({game});
    this._addEventHandlers({game});

    return game;

  }

  _addEventHandlers({game}) {

    this._addEventHandlerUpdate({game});
    this._addEventHandlerEnd({game});

  }

  _addEventHandlerUpdate({game}) {

    const handler = async ({game}) => {

      let gameId = ObjectId(game.id);
      const gameSchema = game;
      const res = await this.games.update({gameId, gameSchema});

      gameId = String(gameId);
      gameManager.sendGameUpdateToSubscribers({gameId});

    };

    game.on('update', handler);

  }

  _addEventHandlerEnd({game}) {

    const handler = async ({game}) => {
      const gameId = game.id;
      gameManager.deleteGameById({gameId});
    };

    game.on('end', handler);

  }

  _validationGameId(gameId) {

    if (!ObjectId.isValid(gameId)) {
      throw new Error('Wrong game id');
    }

  }

  _validationPlayer(playerId) {

    if (!playerId) {
      throw new Error(`Wrong player id: ${playerId}`);
    }

    if (!ObjectId.isValid(playerId)) {
      throw new Error(`Wrong player id: ${playerId}`);
    }

  }

  _validationGameBoardSize(gameBoardSize) {

    const badSize = !gameBoardSize || gameBoardSize < 3;

    if (badSize) {
      throw new Error(`Wrong game board size: ${gameBoardSize}`);
    }

  }

  _checkGameOver({gameSchema}) {
    if (gameSchema.gameOver) {
      throw new Error('The game is over');
    }
  }

}
