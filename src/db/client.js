const knex = require('knex');

function DBClient({ connectionString = process.env.DATABASE_URL || '' } = {}) {
  return knex({
    client: 'pg',
    connection: {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });
}

module.exports = {
  DBClient,
};
