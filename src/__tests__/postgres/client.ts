import { createSqlmancerClient } from '../../'
import { SqlmancerClient } from './sqlmancer'
import { PubSub } from 'graphql-subscriptions'

export const client = createSqlmancerClient<SqlmancerClient>(__dirname + '/schema.ts', require('./knex'), new PubSub())
