import { createSqlmancerClient } from '../../../lib/client/createSqlmancerClient'
import { SqlmancerClient } from './sqlmancer'

export const client = createSqlmancerClient<SqlmancerClient>(__dirname + '/schema.ts', require('./knex'))
