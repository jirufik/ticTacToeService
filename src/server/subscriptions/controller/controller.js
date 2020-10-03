const gameManager = require('../../../gameManager/gameManager');

export default class SubscriptionsController {

  constructor() {
  }

  async addSubscriberByGameId({gameId}) {

    const promise = new Promise((resolve, reject) => {
      gameManager.addSubscriberByGameId({gameId, resolve});
    });

    return await promise;

  }

}
