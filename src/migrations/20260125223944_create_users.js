exports.up = async knex => {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS pgcrypto');
  return knex.schema.createTable('users', t => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('first_name').notNullable();
    t.string('last_name').notNullable();
    t.string('email').notNullable().unique();
    t.string('password').notNullable();
  });
};

exports.down = async knex => {
  // await knex.raw('DROP EXTENSION IF EXISTS pgcrypto');
  return knex.schema.dropTable('users');
};
