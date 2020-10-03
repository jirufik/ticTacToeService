import Router from 'koa-router';
import config from 'config';
import GamesController from "../controller/controller";

const logger = require('../../../logger/logger');
const games = new GamesController();
const versionAPI = config.get('api.version');
const prefix = `/v${versionAPI}/games`;

const gamesRouter = new Router({prefix});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     NewGame:
 *       type: object
 *       required:
 *         - firstPlayerId
 *         - secondPlayerId
 *       properties:
 *         firstPlayerId:
 *           type: string
 *         secondPlayerId:
 *           type: string
 *         gameBoardSize:
 *           type: integer
 *           format: int64
 *           minimum: 3
 *           default: 3
 *
 *     GamePlayer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         isAI:
 *           type: boolean
 *         numberOfMoves:
 *           type: integer
 *         numberOfUndoneMoves:
 *           type: integer
 *
 *     PlayingArea:
 *       type: object
 *       properties:
 *         borrowedPlayer:
 *           type: string
 *           nullable: true
 *         numberOnGameBoard:
 *           type: integer
 *
 *     GameBoard:
 *       type: object
 *       properties:
 *         size:
 *           type: integer
 *         area:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlayingArea'
 *
 *     Game:
 *       type: object
 *       properties:
 *         firstPlayer:
 *           $ref: '#/components/schemas/GamePlayer'
 *         secondPlayer:
 *           $ref: '#/components/schemas/GamePlayer'
 *         gameOver:
 *           type: boolean
 *         playerMoveId:
 *           type: string
 *           nullable: true
 *         winnerId:
 *           type: string
 *           nullable: true
 *         surrenderedPlayer:
 *           type: string
 *           nullable: true
 *         revision:
 *           type: integer
 *         gameBoard:
 *           $ref: '#/components/schemas/GameBoard'
 *         created:
 *           type: string
 *           format: date-time
 *         id:
 *           type: string
 *
 *     Move:
 *       type: object
 *       properties:
 *         playerId:
 *           type: string
 *         numberOnGameBoard:
 *           type: integer
 *         revision:
 *           type: integer
 */


/**
 * @swagger
 *
 * /games:
 *   post:
 *     description: Creates a game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewGame'
 *     responses:
 *       201:
 *         description: game
 */
gamesRouter.post('/', async (ctx, next) => {

  const game = ctx.request.body;
  game.gameBoardSize = Number(game.gameBoardSize);

  try {

    const createdGame = await games.add(game);
    ctx.body = createdGame;
    ctx.status = 201;

  } catch (error) {
    processError({error, ctx});
  }

});

/**
 * @swagger
 *
 * /games/{gameId}:
 *   post:
 *     description: Player make move
 *     parameters:
 *      - name: gameId
 *        in: path
 *        required: true
 *        schema:
 *         type : string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Move'
 *     responses:
 *       201:
 *         description: game
 */
gamesRouter.post('/:gameId', async (ctx, next) => {

  const move = ctx.request.body;
  const gameId = ctx.params.gameId;
  move.gameId = gameId;

  try {

    const gameSchema = await games.makeMove(move);
    ctx.body = gameSchema;
    ctx.status = 201;

  } catch (error) {
    processError({error, ctx});
  }

});

/**
 * @swagger
 * /games:
 *   get:
 *     description: Returns games
 *     parameters:
 *      - name: offset
 *        in: query
 *        required: false
 *        schema:
 *          type: integer
 *          format: int64
 *      - name: limit
 *        in: query
 *        required: false
 *        schema:
 *          type: integer
 *          format: int64
 *     produces:
 *      - application/json
 *     responses:
 *       '200':
 *         description: games
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Game'
 */
gamesRouter.get('/', async (ctx, next) => {

  const {offset, limit} = ctx.query;

  try {
    ctx.body = await games.get({offset, limit});
  } catch (error) {
    processError({error, ctx});
  }

});

/**
 * @swagger
 * /games/{gameId}:
 *   get:
 *     description: Returns a game by id
 *     parameters:
 *      - name: gameId
 *        in: path
 *        required: true
 *        schema:
 *         type : string
 *     produces:
 *      - application/json
 *     responses:
 *       '200':
 *         description: game
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Game'
 */
gamesRouter.get('/:gameId', async (ctx, next) => {

  try {

    const gameId = ctx.params.gameId;
    const game = await games.getByGameId({gameId});

    if (game) {
      ctx.body = game;
    } else {
      ctx.status = 204;
    }

  } catch (error) {
    processError({error, ctx});
  }

});

function processError({error, ctx}) {

  logger.debug(error);

  const isWrong = error.message.toLowerCase().startsWith('wrong');
  if (isWrong) {
    ctx.status = 400;
    return;
  }

  const isGameOver = error.message.toLowerCase().startsWith('the game is over');
  if (isGameOver) {
    ctx.status = 400;
    return;
  }

  logger.error(error);
  throw error;

}

export default gamesRouter;
