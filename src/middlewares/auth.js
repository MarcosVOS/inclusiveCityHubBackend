import jwt from 'jsonwebtoken';
import db from '../database/knex.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function ensureAuthenticated(request, reply) {
  try {
    const auth = request.headers['authorization'] || request.headers['Authorization'];
    if (!auth) return reply.status(401).send({ error: 'missing authorization' });
    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return reply.status(401).send({ error: 'invalid authorization format' });
    const token = parts[1];
    const payload = jwt.verify(token, JWT_SECRET);
    // attach user to request
    const user = await db('users').where({ id: payload.id }).first();
    if (!user) return reply.status(401).send({ error: 'user not found' });
    request.user = user;
  } catch (err) {
    request.log?.error('auth failed', err);
    return reply.status(401).send({ error: 'invalid token' });
  }
}

export async function ensureEnterprise(request, reply) {
  // assumes ensureAuthenticated already ran
  const user = request.user;
  if (!user) return reply.status(401).send({ error: 'not authenticated' });
  if (user.user_type !== 'enterprise') return reply.status(403).send({ error: 'enterprise only' });
}
