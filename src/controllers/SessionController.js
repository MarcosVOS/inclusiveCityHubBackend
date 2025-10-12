import db from '../database/knex.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export default class SessionController {
  static async create(request, reply) {
    console.log("\n\n\n\n\n\n chegou 1")
    try {
      const { email, password } = request.body || {};
      if (!email || !password) return reply.status(400).send({ error: 'email and password required' });
      console.log("\n\n\n\n\n\n chegou 2")
      const user = await db('users').where({ email }).first();
      if (!user) return reply.status(404).send({ error: 'user not found' });
      console.log("\n\n\n\n\n\n chegou 3")
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return reply.status(401).send({ error: 'invalid credentials' });
      console.log("\n\n\n\n\n\n chegou 4")
      const payload = { id: user.id, user_type: user.user_type };
      console.log("\n\n\n\n\n\n chegou 5")
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      // omit password from returned user
      const { password: _p, ...userSafe } = user;
      console.log("\n\n\n\n\n\n chegou 6")
      return reply.status(200).send({ user: userSafe, token });
    
    } catch (err) {
        console.log("\n\n\n\n\n\n chegou 7", err)
      request.log?.error('session create failed', err);
      return reply.status(500).send({ error: 'internal' });
    }
  }
}
