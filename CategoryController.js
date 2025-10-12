import CategoryModel from '../models/CategoryModel.js';

export default class CategoryController {
  static async index(request, reply) {
    try {
      const rows = await CategoryModel.findAll();
      return reply.status(200).send(rows);
    } catch (err) {
      request.log?.error('list categories failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  }

  static async create(request, reply) {
    try {
      const { name } = request.body || {};
      if (!name) return reply.status(400).send({ error: 'name required' });
      const id = await CategoryModel.create(name);
      return reply.status(201).send({ id });
    } catch (err) {
      request.log?.error('create category failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  }
}
