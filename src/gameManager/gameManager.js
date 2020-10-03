import pathExists from 'jrf-path-exists';

class GameManager {

  constructor() {

    this.games = {};

  }

  getGameById({gameId}) {
    this._validationGameId({gameId});
    return pathExists(this, `games.${gameId}.game`);
  }

  addGame({game}) {

    const gameId = game.id;
    this._validationGameId({gameId});

    this.games[gameId] = {
      game,
      subscribers: new Set()
    };

  }

  deleteGameById({gameId}) {
    this._validationGameId({gameId});
    this.sendGameUpdateToSubscribers({gameId});
    delete this.games[gameId];
  }

  addSubscriberByGameId({gameId, resolve}) {

    this._validationGameId({gameId});

    const subscribers = this.getSubscribersByGameId({gameId});
    if (!subscribers) {
      throw new Error(`Wrong game not found, id: ${gameId}`);
    }

    subscribers.add(resolve);

  }

  sendGameUpdateToSubscribers({gameId}) {

    const subscribers = this.getSubscribersByGameId({gameId});
    if (!subscribers) return;

    const game = this.getGameById({gameId});
    const gameSchema = game.gameSchema;

    for (const subscriber of subscribers) {
      subscriber(gameSchema);
      subscribers.delete(subscriber);
    }

  }

  getSubscribersByGameId({gameId}) {
    return pathExists(this, `games.${gameId}.subscribers`);
  }

  _validationGameId({gameId}) {
    if (!gameId) {
      throw new Error(`Wrong game id`);
    }
  }

}

const gameManager = new GameManager();

module.exports = gameManager;
