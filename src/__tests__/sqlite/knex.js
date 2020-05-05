const Knex = require('knex')
const path = require('path')

/**
 * @type { import('knex') }
 */
module.exports = Knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, '../../../sakila.db'),
  },
  useNullAsDefault: true,
})
