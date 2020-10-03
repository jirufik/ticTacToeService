import pathExists from 'jrf-path-exists';
import processId from "../../utils/processId";

const mongoDb = require('../../../mongoDbConnector/mongoDbConnector');

export default class PlayersModel {

  constructor() {
  }

  async add({playerObjectDb}) {

    const collectionPlayers = await mongoDb.getCollection('players');
    const res = await collectionPlayers.insertOne(playerObjectDb);
    const player = pathExists(res, 'ops[0]');
    const id = res.insertedId;
    player.id = id;
    delete player._id;

    return player;

  }

  async get({skip = 0, limit = 0, sort = {created: 1}, playerId, name} = {}) {

    const query = {};

    if (playerId) {
      query._id = playerId;
    }

    if (name) {
      query.name = name;
    }

    const collectionPlayers = await mongoDb.getCollection('players');
    let players = await collectionPlayers
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    players = processId({arrayOfObjects: players});

    return players;

  }

}
