import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import config from 'config';
import swaggerRouter from "./swagger/swagger";
import {koaSwagger} from 'koa2-swagger-ui';
import playersRouter from "./players/routes/routes";
import gamesRouter from "./games/routes/routes";
import subscriptionsRouter from "./subscriptions/routes/routes";

const port = process.env.PORT || config.get('server.port');

const app = new Koa();
app.use(bodyParser());

app.use(swaggerRouter.routes());
app.use(koaSwagger({
  routePrefix: '/api-docs',
  swaggerOptions: {
    url: `http://localhost:${port}/api-docs.json`
  },
}));

app.use(playersRouter.routes());
app.use(gamesRouter.routes());
app.use(subscriptionsRouter.routes());

app.listen(port, function () {
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`server is running on the port: ${port}`);
});
