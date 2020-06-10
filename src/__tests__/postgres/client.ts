import { createSqlmancerClient } from '../../'
import { SqlmancerClient } from './sqlmancer'
import { }

export const client = createSqlmancerClient<SqlmancerClient>(__dirname + '/schema.ts', require('./knex'))
