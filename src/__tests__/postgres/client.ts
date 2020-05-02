import { createSqlmancerClient } from '../../'
import { SqlmancerClient } from './sqlmancer'

export const client = createSqlmancerClient<SqlmancerClient>(__dirname + '/schema.ts', require('./knex'))
