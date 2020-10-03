import swaggerJSDoc from 'swagger-jsdoc';
import Router from 'koa-router';
import config from 'config';

const port = process.env.PORT || config.get('server.port');
const versionAPI = config.get('api.version');

const options = {
  definition: {
    openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
    info: {
      title: 'Tic tac toe', // Title (required)
      version: '1', // Version (required)
    },
    servers: [{
      url: `http://localhost:${port}/v${versionAPI}`,
      description: 'Development server'
    }]
  },
  // Path to the API docs
  apis: [
    './src/server/players/routes/routes.js',
    './src/server/games/routes/routes.js',
    './src/server/subscriptions/routes/routes.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerRouter = new Router();
swaggerRouter.get('/api-docs.json', async (ctx, next) => {
  ctx.body = swaggerSpec;
});

export default swaggerRouter;
