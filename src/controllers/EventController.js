import EventModel from '../models/EventModel.js';

export default class EventController {
  static async create(request, reply) {
    try {
      const data = request.body || {};
      // minimal validation
      if (!data.enterprise_id || !data.category_id || !data.name) {
        return reply.status(400).send({ error: 'enterprise_id, category_id and name are required' });
      }
      const id = await EventModel.create(data);
      return reply.status(201).send({ id });
    } catch (err) {
      request.log?.error('create event failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  }

  static async indexApproved(request, reply) {
    try {
      const rows = await EventModel.findAllApproved();
      return reply.status(200).send(rows);
    } catch (err) {
      request.log?.error('list approved events failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  }
}
