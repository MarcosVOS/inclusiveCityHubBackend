import db from '../database/knex.js';

export default class CategoryModel {
  static async create(name) {
    const inserted = await db('categories').insert({ name }).returning('id');
    if (Array.isArray(inserted) && inserted.length > 0) {
      const first = inserted[0];
      return typeof first === 'object' ? first.id : first;
    }
    return null;
  }

  static async findAll() {
    return db('categories').select('id', 'name').orderBy('id');
  }

  static async findById(id) {
    return db('categories').select('id', 'name').where({ id }).first();
  }
}
