export async function up(knex) {
  await knex.schema.createTable('events', (table) => {
    table.increments('id').primary();
    table.integer('enterprise_id').unsigned().notNullable();
    table.integer('category_id').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.text('description');
    table.dateTime('starts_at').notNullable();
    table.dateTime('ends_at');
    table.string('location', 255).notNullable();
    table.boolean('is_approved').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['enterprise_id'], 'idx_events_enterprise_id');
    table.index(['category_id'], 'idx_events_category_id');
    table.foreign('enterprise_id').references('enterprises.user_id').onDelete('CASCADE');
    table.foreign('category_id').references('categories.id');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('events');
}
