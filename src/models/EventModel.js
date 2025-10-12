import db from '../database/knex.js';

export default class EventModel {
  static async create(data) {
    // expected data: enterprise_id, category_id, name, description, starts_at, ends_at, location, is_approved (optional)
    const insertData = {
      enterprise_id: data.enterprise_id,
      category_id: data.category_id,
      name: data.name,
      description: data.description || null,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
      location: data.location || null,
      is_approved: data.is_approved === undefined ? false : data.is_approved
    };

    const inserted = await db('events').insert(insertData).returning('id');
    if (Array.isArray(inserted) && inserted.length > 0) {
      const first = inserted[0];
      return typeof first === 'object' ? first.id : first;
    }
    return null;
  }

  static async findAllApproved() {
    return db('events').where({ is_approved: true }).select('*').orderBy('id');
  }
}
