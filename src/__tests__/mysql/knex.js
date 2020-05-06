const Knex = require('knex')

/**
 * @type { import('knex') }
 */
module.exports = Knex({
  client: 'mysql2',
  connection: {
    host: 'localhost',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    multipleStatements: true,
  },
  debug: process.env.DEBUG === 'true',
})
