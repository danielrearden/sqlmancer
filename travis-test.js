const { Client } = require('pg')

;(async () => {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '',
    port: 5432,
  })
  await client.connect()
  const res = await client.query('SELECT $1::text as message', ['Hello world!'])
  console.log(res.rows[0].message)
  await client.end()
  process.exit(0)
})().catch(error => {
  console.log(error)
  process.exit(1)
})
