import EventController from '../controllers/EventController.js';
import { ensureAuthenticated, ensureEnterprise } from '../middlewares/auth.js';

export default async function (app, opts) {
  app.get('/events/approved', async (request, reply) => {
    return EventController.indexApproved(request, reply);
  });

  app.post('/events', { preHandler: [ensureAuthenticated, ensureEnterprise] }, async (request, reply) => {
    return EventController.create(request, reply);
  });
}
