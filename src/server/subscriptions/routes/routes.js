import Router from 'koa-router';
import config from 'config';
import SubscriptionsController from "../controller/controller";

const subscriptions = new SubscriptionsController();
const versionAPI = config.get('api.version');
const prefix = `/v${versionAPI}/subscriptions`;

const subscriptionsRouter = new Router({prefix});

/**
 * @swagger
 * /subscriptions/{gameId}:
 *   get:
 *     description: Returns a update game by id
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
subscriptionsRouter.get('/:gameId', async (ctx, next) => {

  try {

    const gameId = ctx.params.gameId;
    const gameSchema = await subscriptions.addSubscriberByGameId({gameId});

    ctx.body = gameSchema;

  } catch (error) {
    processError({error, ctx});
  }

});

subscriptionsRouter.get('/', async (ctx, next) => {

  try {
    ctx.status = 200;
  } catch (error) {
    processError({error, ctx});
  }

});

function processError({error, ctx}) {

  const isWrong = error.message.toLowerCase().startsWith('wrong');
  if (isWrong) {
    ctx.status = 400;
    return;
  }

  throw error;

}


export default subscriptionsRouter;
