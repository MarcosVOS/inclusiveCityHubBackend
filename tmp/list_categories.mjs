import db from '../src/database/knex.js';

async function list() {
  try {
    const rows = await db('categories').select('*');
    console.log('categories:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('error querying categories:', err.message);
  } finally {
    await db.destroy();
  }
}

list();
