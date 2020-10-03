import pathExists from 'jrf-path-exists';

export default class Line {

  constructor({playingAreas, isDiagonal = false}) {

    const badPlayingAreas = !Array.isArray(playingAreas);
    if (badPlayingAreas) {
      throw new Error('Wrong playing areas');
    }

    this.area = playingAreas;
    this.isDiagonal = isDiagonal;
    this.state = null;
    this.updateState();

  }

  getState() {
    return this.state;
  }

  updateState() {

    this.state = {
      isFreeLine: null,
      isFullLine: null,
      isPartiallyLIne: null,
      totalPlayingAreas: this.area.length,
      totalFreePlayingAreas: 0,
      totalOccupiedPlayingAreas: 0,
      playersHaveOccupiedAreas: {},
      freeAreas: []
    };

    for (const playingArea of this.area) {

      this._checkPlayingAreaIsOccupied({playingArea});
      this._checkLine();

    }

  }

  _checkPlayingAreaIsOccupied({playingArea}) {

    const borrowedPlayerId = playingArea.borrowedPlayer;
    if (!borrowedPlayerId) {
      this.state.totalFreePlayingAreas += 1;
      this.state.freeAreas.push(playingArea);
      return;
    }

    const playerIdExists = pathExists(this, `state.playersHaveOccupiedAreas.${borrowedPlayerId}`);
    if (!playerIdExists) {
      this.state.playersHaveOccupiedAreas[borrowedPlayerId] = 0;
    }

    this.state.playersHaveOccupiedAreas[borrowedPlayerId] += 1;
    this.state.totalOccupiedPlayingAreas += 1;

  }

  _checkLine() {

    if (!this.state.totalOccupiedPlayingAreas) {
      this.state.isFreeLine = true;
      this.state.isFullLine = false;
      this.state.isPartiallyLIne = false;
      return;
    }

    if (!this.state.totalFreePlayingAreas) {
      this.state.isFreeLine = false;
      this.state.isFullLine = true;
      this.state.isPartiallyLIne = false;
      return;
    }

    this.state.isFreeLine = false;
    this.state.isFullLine = false;
    this.state.isPartiallyLIne = true;

  }

}
