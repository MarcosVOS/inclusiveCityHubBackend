import db from "../database/knex.js";
import bcrypt from 'bcryptjs';

export default async function (app, opts) {
  app.post('/users', async (request, reply) => {
    const { email, password, user_type, cnpj } = request.body;
    if (!email || !password || !user_type) {
      return reply.status(400).send({ error: 'missing fields' });
    }

    // basic email format check (simple)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return reply.status(400).send({ error: 'invalid email' });
    }

    // check duplicate
    const exists = await db('users').where({ email }).first();
    if (exists) return reply.status(409).send({ error: 'email already exists' });

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // use transaction when inserting user + enterprise
    try {
      const result = await db.transaction(async (trx) => {
        const inserted = await trx('users').insert({ email, password: hashed, user_type }).returning('id');
        let userId;
        if (Array.isArray(inserted) && inserted.length > 0) {
          const first = inserted[0];
          userId = typeof first === 'object' ? first.id : first;
        }

        if (user_type === 'enterprise') {
          if (!cnpj) {
            throw { status: 400, message: 'cnpj required for enterprise' };
          }
          await trx('enterprises').insert({ user_id: userId, cnpj });
        }
        return userId;
      });

      return reply.status(201).send({ id: result });
    } catch (err) {
      // handle known thrown errors
      if (err && err.status) return reply.status(err.status).send({ error: err.message });
      request.log?.error('create user failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  });

  // List users (omit password) and include enterprise info when present
  app.get('/users', async (request, reply) => {
    const rows = await db('users as u')
      .leftJoin('enterprises as e', 'u.id', 'e.user_id')
      .select(
        'u.id',
        'u.email',
        'u.user_type',
        'u.created_at',
        'u.updated_at',
        'e.cnpj as enterprise_cnpj',
        'e.is_approved as enterprise_is_approved'
      );
    return reply.status(200).send(rows);
  });

  app.get('/users/:id', async (request, reply) => {
    const { id } = request.params;
    const row = await db('users as u')
      .leftJoin('enterprises as e', 'u.id', 'e.user_id')
      .select(
        'u.id',
        'u.email',
        'u.user_type',
        'u.created_at',
        'u.updated_at',
        'e.cnpj as enterprise_cnpj',
        'e.is_approved as enterprise_is_approved'
      )
      .where('u.id', id)
      .first();
    if (!row) return reply.status(404).send({ error: 'not found' });
    return reply.status(200).send(row);
  });

  // Update user
  app.put('/users/:id', async (request, reply) => {
    try {
  const { id } = request.params;
  const { email, password, user_type, cnpj } = request.body || {};

      const user = await db('users').where({ id }).first();
      if (!user) return reply.status(404).send({ error: 'not found' });

      const updates = {};
      if (email) updates.email = email;
      if (password) updates.password = await bcrypt.hash(password, 10);
      if (user_type) updates.user_type = user_type;

      if (Object.keys(updates).length) {
        await db('users').where({ id }).update({ ...updates, updated_at: db.fn.now() });
      }

      // Enterprise handling
      if (user_type === 'enterprise') {
        const ent = await db('enterprises').where({ user_id: id }).first();
        if (ent) {
          if (cnpj) await db('enterprises').where({ user_id: id }).update({ cnpj, updated_at: db.fn.now() });
        } else {
          if (!cnpj) return reply.status(400).send({ error: 'cnpj required for enterprise' });
          await db('enterprises').insert({ user_id: id, cnpj });
        }
      }

      return reply.status(200).send({ id: Number(id) });
    } catch (err) {
      app.log && app.log.error ? app.log.error(err) : console.error(err);
      return reply.status(500).send({ error: 'internal' });
    }
  });

  // Delete user
  app.delete('/users/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const user = await db('users').where({ id }).first();
      if (!user) return reply.status(404).send({ error: 'not found' });

      await db('users').where({ id }).del();
      return reply.status(204).send();
    } catch (err) {
      app.log && app.log.error ? app.log.error(err) : console.error(err);
      return reply.status(500).send({ error: 'internal' });
    }
  });
  }
