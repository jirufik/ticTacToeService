import Line from "../line/line";
import pathExists from 'jrf-path-exists';

export default class Lines {

  constructor({area, size} = {}) {

    this.horizontal = [];
    this.vertical = [];
    this.diagonal = [];
    this.reverseDiagonal = [];
    this.allLines = [];

    const createLines = area && size;
    if (!createLines) return;

    this.init({area, size});

  }

  reset() {

    this.horizontal = [];
    this.vertical = [];
    this.diagonal = [];
    this.reverseDiagonal = [];
    this.allLines = [];

  }

  init({area, size}) {

    this.reset();

    this._createHorizontalLines({area, size});
    this._createVerticalLines({area, size});
    this._createDiagonalLines({area, size});
    this._createReverseDiagonalLines({area, size});

  }

  updateStateLines() {

    for (const line of this.allLines) {
      line.updateState();
    }

  }

  playerIsWin({playerId}) {

    for (const line of this.allLines) {

      const lineState = line.getState();

      if (!lineState.isFullLine) continue;

      const playerHaveOccupiedAreas = pathExists(lineState, `playersHaveOccupiedAreas.${playerId}`, 0);
      const allAreasOccupiedPlayer = playerHaveOccupiedAreas === lineState.totalOccupiedPlayingAreas;
      if (allAreasOccupiedPlayer) return true;

    }

    return false;

  }

  playerCanWin({playerId}) {

    for (const line of this.allLines) {

      const lineState = line.getState();

      if (lineState.isFullLine) continue;

      const playerHaveOccupiedAreas = pathExists(lineState, `playersHaveOccupiedAreas.${playerId}`, 0);
      const allAreasOccupiedPlayer = playerHaveOccupiedAreas === lineState.totalOccupiedPlayingAreas;
      const onlyOneFreePlayingArea = lineState.totalFreePlayingAreas === 1
      const canWin = onlyOneFreePlayingArea && allAreasOccupiedPlayer;

      if (canWin) {
        return lineState.freeAreas;
      }

    }

  }

  playerCanIncreaseLine({playerId}) {

    const canIncreaseLine = {
      freeAreas: [],
      totalOccupiedPlayingAreas: 0,
      isDiagonal: false
    };

    for (const line of this.allLines) {

      const lineState = line.getState();

      if (!lineState.isPartiallyLIne) continue;

      const playerHaveOccupiedAreas = pathExists(lineState, `playersHaveOccupiedAreas.${playerId}`, 0);
      const totalOccupiedPlayingAreas = lineState.totalOccupiedPlayingAreas;

      const allAreasOccupiedPlayer = playerHaveOccupiedAreas === totalOccupiedPlayingAreas;
      if (!allAreasOccupiedPlayer) continue;

      const bigger = totalOccupiedPlayingAreas > canIncreaseLine.totalOccupiedPlayingAreas;
      if (bigger) {
        canIncreaseLine.freeAreas = lineState.freeAreas;
        canIncreaseLine.totalOccupiedPlayingAreas = totalOccupiedPlayingAreas;
        canIncreaseLine.isDiagonal = line.isDiagonal;
        continue;
      }

      const equal = totalOccupiedPlayingAreas === canIncreaseLine.totalOccupiedPlayingAreas;
      const greaterPriority = !canIncreaseLine.isDiagonal && line.isDiagonal;
      if (equal && greaterPriority) {
        canIncreaseLine.freeAreas = lineState.freeAreas;
        canIncreaseLine.totalOccupiedPlayingAreas = totalOccupiedPlayingAreas;
        canIncreaseLine.isDiagonal = line.isDiagonal;
      }

    }

    if (canIncreaseLine.totalOccupiedPlayingAreas) {
      return canIncreaseLine.freeAreas;
    }

  }

  playerCanIncreaseFreeLine() {

    const canIncreaseLine = {
      freeAreas: [],
      isDiagonal: false
    };

    for (const line of this.allLines) {

      const lineState = line.getState();

      if (!lineState.isFreeLine) continue;

      if (line.isDiagonal) {
        return canIncreaseLine.freeAreas;
      }

      canIncreaseLine.freeAreas = lineState.freeAreas;

    }

    if (canIncreaseLine.freeAreas.length) {
      return canIncreaseLine.freeAreas;
    }

  }

  playerCanGo() {

    for (const line of this.horizontal) {
      const lineState = line.getState();
      if (lineState.totalFreePlayingAreas) {
        return lineState.freeAreas;
      }
    }

  }

  _createHorizontalLines({area, size}) {

    for (let row = 0; row < size; row++) {

      const playingAreas = [];

      for (let col = 0; col < size; col++) {
        const index = row * size + col;
        const playingArea = area[index];
        playingAreas.push(playingArea);
      }

      const line = new Line({playingAreas});
      this.horizontal.push(line);
      this.allLines.push(line);

    }

  }

  _createVerticalLines({area, size}) {

    for (let col = 0; col < size; col++) {

      const playingAreas = [];

      for (let row = 0; row < size; row++) {
        const index = row * size + col;
        const playingArea = area[index];
        playingAreas.push(playingArea);
      }

      const line = new Line({playingAreas});
      this.vertical.push(line);
      this.allLines.push(line);

    }

  }

  _createDiagonalLines({area, size}) {

    const playingAreas = [];

    for (let row = 0; row < size; row++) {

      const index = row * size + row;
      const playingArea = area[index];
      playingAreas.push(playingArea);

    }

    const line = new Line({playingAreas, isDiagonal: true});
    this.diagonal.push(line);
    this.allLines.push(line);

  }

  _createReverseDiagonalLines({area, size}) {

    const playingAreas = [];

    for (let row = 0; row < size; row++) {

      const index = (row + 1) * (size - 1);
      const playingArea = area[index];
      playingAreas.push(playingArea);

    }

    const line = new Line({playingAreas, isDiagonal: true});
    this.reverseDiagonal.push(line);
    this.allLines.push(line);

  }

}
