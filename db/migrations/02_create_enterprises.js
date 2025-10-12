export async function up(knex) {
  await knex.schema.createTable('enterprises', (table) => {
    table.integer('user_id').unsigned().primary();
    table.string('cnpj', 18).notNullable().unique();
    table.boolean('is_approved').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.index(['cnpj'], 'idx_enterprises_cnpj');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('enterprises');
}
