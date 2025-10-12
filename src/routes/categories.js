import db from '../database/knex.js';

export default async function categoriesRoutes(fastify) {
  fastify.get('/categories', async (request, reply) => {
    try {
      const rows = await db('categories').select('id', 'name').orderBy('id');
      return reply.code(200).send(rows);
    } catch (err) {
      request.log?.error('failed to list categories', err);
      return reply.code(500).send({ error: 'Failed to fetch categories' });
    }
  });
}
