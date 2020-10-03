import pathExists from 'jrf-path-exists';
import PlayersModel from "../model/model";
import {ObjectId} from 'mongodb';

export default class PlayersController {

  constructor() {

    this.players = new PlayersModel();

  }

  async add(player) {

    this._validationPlayer(player);

    const name = player.name;
    const playerExists = await this.playerExists({name});
    if (playerExists) {
      throw new Error('The player by that name already exists');
    }

    player.isAI = Boolean(player.isAI);
    player.created = new Date();

    const newPlayer = await this.players.add({playerObjectDb: player});

    return newPlayer;

  }

  async get({offset = 0, limit = 0} = {}) {

    offset = Number(offset);
    limit = Number(limit);

    const players = await this.players.get({skip: offset, limit});

    return players;

  }

  async getByPlayerId({playerId}) {

    if (!ObjectId.isValid(playerId)) {
      throw new Error('Wrong player id');
    }

    playerId = ObjectId(playerId);

    const players = await this.players.get({playerId});
    const player = pathExists(players, '[0]');

    return player;

  }

  async playerExists({name}) {

    const players = await this.players.get({name});
    const playerExists = Boolean(players.length);

    return playerExists;

  }

  _validationPlayer(player) {

    const badPlayer = !player || typeof player !== 'object';
    const badName = !player.name || typeof player.name !== 'string';
    const noValid = badPlayer || badName;

    if (noValid) {
      throw new Error('Wrong player');
    }

  }

}
