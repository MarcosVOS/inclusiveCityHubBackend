export async function seed(knex) {
  const categories = [
    { name: 'Acessibilidade Física' }
  ];

  // Use Postgres ON CONFLICT DO NOTHING via Knex onConflict().ignore()
  await knex('categories').insert(categories).onConflict('name').ignore();
}
