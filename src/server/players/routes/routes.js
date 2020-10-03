import Router from 'koa-router';
import config from 'config';
import PlayersController from "../controller/controller";

const logger = require('../../../logger/logger');
const players = new PlayersController;
const versionAPI = config.get('api.version');
const prefix = `/v${versionAPI}/players`;

const playersRouter = new Router({prefix});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     NewPlayer:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         isAI:
 *           type: boolean
 *           default: false
 *
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         isAI:
 *           type: boolean
 *         created:
 *           type: string
 *           format: date-time
 *
 */


/**
 * @swagger
 *
 * /players:
 *   post:
 *     description: Creates a player
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPlayer'
 *     responses:
 *       201:
 *         description: player
 */
playersRouter.post('/', async (ctx, next) => {

  const player = ctx.request.body;

  try {

    const createdPlayer = await players.add(player);
    ctx.body = createdPlayer;
    ctx.status = 201;

  } catch (error) {
    processError({error, ctx});
  }

});


/**
 * @swagger
 * /players:
 *   get:
 *     description: Returns players
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
 *         description: players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
playersRouter.get('/', async (ctx, next) => {

  const {offset, limit} = ctx.query;

  try {
    ctx.body = await players.get({offset, limit});
  } catch (error) {
    processError({error, ctx});
  }

});

/**
 * @swagger
 * /players/{playerId}:
 *   get:
 *     description: Returns a player by id
 *     parameters:
 *      - name: playerId
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
 *               $ref: '#/components/schemas/Player'
 */
playersRouter.get('/:playerId', async (ctx, next) => {

  try {

    const playerId = ctx.params.playerId;
    const player = await players.getByPlayerId({playerId});

    if (player) {
      ctx.body = player;
    } else {
      ctx.status = 204;
    }

  } catch (error) {
    processError({error, ctx});
  }

});

function processError({error, ctx}) {

  const playerExists = error.message === 'The player by that name already exists';
  if (playerExists) {
    ctx.status = 409;
    return;
  }

  const isWrong = error.message.toLowerCase().startsWith('wrong');
  if (isWrong) {
    ctx.status = 400;
    return;
  }

  logger.error(error);
  throw error;

}


export default playersRouter;
