/**
 * Migration: create users table according to requirements.md
 */
export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password', 255).notNullable();
    table.enu('user_type', ['common', 'enterprise', 'admin']).notNullable().defaultTo('common');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['email'], 'idx_users_email');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('users');
}
