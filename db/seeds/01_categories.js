/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('categories').del();
  await knex('categories').insert([
    { name: 'Acessibilidade Física' },
    { name: 'Acessibilidade Digital' },
    { name: 'Acessibilidade Comunicacional' }
  ]);
};