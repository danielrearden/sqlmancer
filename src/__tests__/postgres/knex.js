const Knex = require('knex')

/**
 * @type { import('knex') }
 */
module.exports = Knex({
  client: 'postgresql',
  connection: {
    host: 'localhost',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  debug: process.env.DEBUG === 'true',
})
