const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const dialectsToMigrate = process.env.DB ? process.env.DB.split(' ') : ['postgres', 'mysql', 'sqlite']
const dialects = _.pickBy(
  {
    postgres: require('../test/integration/postgres/knex'),
    mysql: require('../test/integration/mysql/knex'),
    sqlite: require('../test/integration/sqlite/knex'),
  },
  (_value, key) => dialectsToMigrate.includes(key)
)

Object.keys(dialects)
  .reduce((previousPromise, name) => {
    const knex = dialects[name]
    return previousPromise.then(async () => {
      await knex.transaction(async (trx) => {
        process.stdout.write(`Migrating ${name} database... `)
        await runFromFile(trx, name, 'migrate')
        console.log('Done!')
        process.stdout.write(`Seeding ${name} database... `)
        await runFromFile(trx, name, 'seed')
        console.log('Done!')
      })
      await knex.destroy()
    })
  }, Promise.resolve())
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

async function runFromFile(transaction, dialectName, action) {
  const filePath = path.join(
    __dirname,
    '../test/integration/',
    dialectName,
    'db',
    action === 'migrate' ? 'schema.sql' : 'seed.sql'
  )
  const sql = fs.readFileSync(filePath, 'utf-8')
  if (dialectName === 'sqlite') {
    await sql.split(/\n\n/).reduce((previousPromise, statement) => {
      return previousPromise.then(async () => transaction.raw(statement))
    }, Promise.resolve())
  } else {
    await transaction.raw(sql)
  }
}
