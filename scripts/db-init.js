const fs = require('fs')
const path = require('path')
const { dialects } = require('../src/__tests__/knex')

dialects.reduce((previousPromise, { name, knex }) => {
  return previousPromise.then(async () => {
    await knex.transaction(async trx => {
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

async function runFromFile(transaction, dialectName, action) {
  const filePath = path.join(
    __dirname,
    '../src/__tests__/',
    dialectName,
    action === 'migrate' ? 'schema.sql' : 'seed.sql'
  )
  const sql = fs.readFileSync(filePath, 'utf-8')
  if (dialectName === 'sqlite3') {
    await sql.split(/\n\n/).reduce((previousPromise, statement) => {
      return previousPromise.then(async () => transaction.raw(statement))
    }, Promise.resolve())
  } else {
    await transaction.raw(sql)
  }
}
