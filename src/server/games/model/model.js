import pathExists from 'jrf-path-exists';
import processId from "../../utils/processId";

const mongoDb = require('../../../mongoDbConnector/mongoDbConnector');

export default class GamesModel {

  constructor() {
  }

  async add({gameObjectDb}) {

    const collectionGames = await mongoDb.getCollection('games');
    const res = await collectionGames.insertOne(gameObjectDb);
    const game = pathExists(res, 'ops[0]');
    const id = res.insertedId;
    game.id = id;
    delete game._id;

    return game;

  }

  async get({skip = 0, limit = 0, sort = {created: 1}, gameId} = {}) {

    const query = {};

    if (gameId) {
      query._id = gameId;
    }

    const collectionGames = await mongoDb.getCollection('games');
    let games = await collectionGames
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    games = processId({arrayOfObjects: games});

    return games;

  }

  async update({gameId, gameSchema}) {

    const filter = {
      _id: gameId
    };

    const doc = {$set: gameSchema};

    const collectionGames = await mongoDb.getCollection('games');
    const writeResult = await collectionGames.updateOne(filter, doc, {upsert: false});

    return writeResult.result;

  }

}
