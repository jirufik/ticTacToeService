export default class Player {

  constructor({id, name, numberOfMoves = 0, numberOfUndoneMoves = 0, isAI = false}) {

    this.validationId({id});
    this.validationName({name});

    this.id = id;
    this.name = name;
    this.isAI = isAI;
    this.numberOfMoves = numberOfMoves;
    this.numberOfUndoneMoves = numberOfUndoneMoves;

  }

  static createPlayer({playerObjectDb}) {

    const id = String(playerObjectDb.id);
    const name = playerObjectDb.name;
    const isAI = playerObjectDb.isAI;
    const numberOfMoves = playerObjectDb.numberOfMoves;
    const numberOfUndoneMoves = playerObjectDb.numberOfUndoneMoves;

    const player = new Player({id, name, numberOfMoves, numberOfUndoneMoves, isAI});

    return player;

  }

  increaseNumberOfMoves() {
    this.numberOfMoves += 1;
  }

  increaseNumberOfUndoneMoves() {
    this.numberOfUndoneMoves += 1;
  }

  savePlayer() {

    const id = this.id;
    const name = this.name;
    const isAI = this.isAI;
    const numberOfMoves = this.numberOfMoves;
    const numberOfUndoneMoves = this.numberOfUndoneMoves;

    const playerSchema = {
      id,
      name,
      isAI,
      numberOfMoves,
      numberOfUndoneMoves
    };

    return playerSchema;

  }

  validationId({id}) {
    if (id) return;
    throw new Error('Wrong player id');
  }

  validationName({name}) {
    if (name) return;
    throw new Error('Wrong player name');
  }

}
