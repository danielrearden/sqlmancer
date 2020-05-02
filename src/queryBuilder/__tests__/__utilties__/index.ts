import { execute, parse, GraphQLSchema, GraphQLResolveInfo } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'

import { BaseBuilder } from '../../base'
import { SqlmancerClient } from '../../../__tests__/postgres/sqlmancer'

const dialectsToTest = process.env.DB ? process.env.DB.split(' ') : ['postgres', 'mysql', 'sqlite']

export function getRollback(client: SqlmancerClient) {
  return async function(builder: BaseBuilder, fn: (result: any) => void) {
    const error = new Error('Rolling back transaction')
    await expect(
      client.transaction(async trx => {
        const result = await builder.transaction(trx).execute()
        fn(result)
        throw error
      })
    ).rejects.toStrictEqual(error)
  }
}

export function withDialects(
  fn: (
    client: SqlmancerClient,
    rollback: (builder: BaseBuilder, fn: (result: any) => void) => Promise<void>,
    schema: GraphQLSchema
  ) => void
) {
  dialectsToTest.forEach(name => {
    const client = require(`../../../__tests__/${name}/client`).client as SqlmancerClient
    const schema = require(`../../../__tests__/${name}/schema`).schema as GraphQLSchema
    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
      fn(client, getRollback(client), schema)

      afterAll(async () => {
        await client.destroy()
      })
    })
  })
}

export async function mockResolveInfo(schema: GraphQLSchema, typeName: string, fieldName: string, source: string) {
  let resolveInfo: GraphQLResolveInfo | undefined = undefined

  const schemaWithMiddleware = applyMiddleware(schema, {
    [typeName]: {
      [fieldName]: async (resolve, parent, args, context, info) => {
        resolveInfo = info
        return resolve(parent, args, context, info)
      },
    },
  })

  await execute({ schema: schemaWithMiddleware, document: parse(source) })

  return resolveInfo!
}
