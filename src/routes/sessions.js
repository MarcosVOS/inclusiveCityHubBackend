import SessionController from '../controllers/SessionController.js';

export default async function (app, opts) {
  app.post('/sessions', async (request, reply) => {
    return SessionController.create(request, reply);
  });
}
