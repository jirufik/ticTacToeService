import PlayingArea from './playingArea'

describe('class PlayingArea', () => {

  test('create playingArea without numberOnGameBoard', () => {

    let errorMessage = '';

    try {
      const playingArea = new PlayingArea({});
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toEqual('The number is not listed on the game board');

  });

  test('create playingArea with numberOnGameBoard', () => {

    const numberOnGameBoard = 1;

    const playingArea = new PlayingArea({numberOnGameBoard});

    expect(playingArea.numberOnGameBoard).toEqual(1);
    expect(playingArea.borrowedPlayer).toBeNull();

  });

  test('No player listed', () => {

    const numberOnGameBoard = 1;
    const playingArea = new PlayingArea({numberOnGameBoard});

    let errorMessage = '';

    try {
      playingArea.takeUpThePlayingArea({});
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toEqual('No player listed');

  });

  test('Occupy the playing area already occupied by another playerId', () => {

    const playerId = 'playerA';
    const numberOnGameBoard = 1;
    const playingArea = new PlayingArea({numberOnGameBoard});
    playingArea.borrowedPlayer = 'playerB';

    let errorMessage = '';

    try {
      playingArea.takeUpThePlayingArea({playerId});
    } catch (error) {
      errorMessage = error.message;
    }

    expect(errorMessage).toEqual('The playing area is already occupied by another player');

  });

  test('Player occupies playing area', () => {

    const playerId = 'playerA';
    const numberOnGameBoard = 1;
    const playingArea = new PlayingArea({numberOnGameBoard});

    playingArea.takeUpThePlayingArea({playerId});

    expect(playingArea.borrowedPlayer).toEqual('playerA');

  });

  test('Free up the playing area', () => {

    const playerId = 'playerA';
    const numberOnGameBoard = 1;
    const playingArea = new PlayingArea({numberOnGameBoard});
    playingArea.borrowedPlayer = playerId;

    playingArea.freeUpPlayingArea()

    expect(playingArea.borrowedPlayer).toBeNull();

  });

  test('saveArea', () => {

    const valid = {numberOnGameBoard: 1, borrowedPlayer: 'playerA'};
    const numberOnGameBoard = 1;

    const playingArea = new PlayingArea({numberOnGameBoard});
    playingArea.borrowedPlayer = 'playerA';

    const schema = playingArea.saveArea();

    expect(schema).toMatchObject(valid);

  });


});
