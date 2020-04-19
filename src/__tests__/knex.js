const Knex = require('knex')
const path = require('path')

const dialectsToTest = process.env.DB ? process.env.DB.split(' ') : ['postgres', 'mysql', 'sqlite']

/**
 * @type { { name: string; knex: import('knex') }[] }
 */
module.exports.dialects = [
  {
    name: 'postgres',
    knex: Knex({
      client: 'postgresql',
      connection: {
        host: 'localhost',
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      },
      debug: process.env.DEBUG === 'true',
    }),
  },
  {
    name: 'mysql',
    knex: Knex({
      client: 'mysql2',
      connection: {
        host: 'localhost',
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        multipleStatements: true,
      },
      debug: process.env.DEBUG === 'true',
    }),
  },
  {
    name: 'sqlite',
    knex: Knex({
      client: 'sqlite3',
      connection: {
        filename: path.resolve(__dirname, '../../sakila.db'),
      },
    }),
  },
].filter(dialect => dialectsToTest.includes(dialect.name))
