import Game from "../game/game";
import randomInteger from "../../server/utils/randomInteger";

export default class AI {

  constructor({game}) {

    this.validationGame({game});

    this.game = game;
    this.aiPlayerId = null;
    this.updateAiPlayerId();
    this.enemyPlayerId = null;
    this.updateEnemyPlayerId();

  }

  getFreePlayingArea() {

    const aiPlayerId = this.updateAiPlayerId();
    const enemyPlayerId = this.updateEnemyPlayerId();

    let freePlayingArea = this.playerCanWin({playerId: aiPlayerId});
    if (freePlayingArea) return freePlayingArea;

    freePlayingArea = this.playerCanWin({playerId: enemyPlayerId});
    if (freePlayingArea) return freePlayingArea;

    freePlayingArea = this.playerCanIncreaseLine({playerId: aiPlayerId});
    if (freePlayingArea) return freePlayingArea;

    freePlayingArea = this.playerCanIncreaseFreeLine();
    if (freePlayingArea) return freePlayingArea;

    freePlayingArea = this.playerCanIncreaseLine({playerId: enemyPlayerId});
    if (freePlayingArea) return freePlayingArea;

    freePlayingArea = this.playerCanGo();
    if (freePlayingArea) return freePlayingArea;

  }

  updateAiPlayerId() {
    this.aiPlayerId = this.game.playerMoveId;
    return this.aiPlayerId;
  }

  updateEnemyPlayerId() {

    const firstPlayerId = this.game.firstPlayer.id;
    const secondPlayerId = this.game.secondPlayer.id;
    const firstPlayerIsEnemy = firstPlayerId !== this.aiPlayerId;
    const enemyPlayerId = firstPlayerIsEnemy ? firstPlayerId : secondPlayerId;
    this.enemyPlayerId = enemyPlayerId;

    return this.enemyPlayerId;

  }

  playerCanWin({playerId}) {

    const freePlayingAreas = this.game.gameBoard.lines.playerCanWin({playerId});
    if (!freePlayingAreas) return;

    return this.getRandomArea(freePlayingAreas);

  }

  playerCanIncreaseLine({playerId}) {

    const freePlayingAreas = this.game.gameBoard.lines.playerCanIncreaseLine({playerId});
    if (!freePlayingAreas) return;

    return this.getRandomArea(freePlayingAreas);

  }

  playerCanIncreaseFreeLine() {

    const freePlayingAreas = this.game.gameBoard.lines.playerCanIncreaseFreeLine();
    if (!freePlayingAreas) return;

    return this.getRandomArea(freePlayingAreas);

  }

  playerCanGo() {

    const freePlayingAreas = this.game.gameBoard.lines.playerCanGo();
    if (!freePlayingAreas) return;

    return this.getRandomArea(freePlayingAreas);

  }

  validationGame({game}) {

    const badGame = !game || !(game instanceof Game);
    if (badGame) {
      throw new Error('Wrong game');
    }

  }

  getRandomArea(areas) {

    const min = 1;
    const max = areas.length;
    const numberArea = randomInteger({min, max});

    return areas[numberArea - 1];

  }

}
