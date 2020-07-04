import { execute, parse, GraphQLSchema, GraphQLResolveInfo } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'

import { BaseBuilder } from '../lib/queryBuilder/base'
import { SqlmancerClient } from './integration/postgres/sqlmancer'

const dialectsToTest = process.env.DB ? process.env.DB.split(' ') : ['postgres', 'mysql', 'sqlite']

export function getRollback(client: SqlmancerClient) {
  return async function (builder: BaseBuilder, fn: (result: any) => void) {
    const error = new Error('Rolling back transaction')
    await expect(
      client.transaction(async (trx) => {
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
  const dialects = ['postgres', 'mysql', 'sqlite']
  dialects.forEach((name) => {
    const describeMaybeSkip = dialectsToTest.includes(name) ? describe : describe.skip
    const client = require(`./integration/${name}/client`).client as SqlmancerClient
    const schema = require(`./integration/${name}/schema`).schema as GraphQLSchema
    // eslint-disable-next-line jest/valid-title
    describeMaybeSkip(name, () => {
      fn(client, getRollback(client), schema)

      // eslint-disable-next-line jest/require-top-level-describe
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
        return resolve(parent, args, context, info as any)
      },
    },
  })

  await execute({ schema: schemaWithMiddleware, document: parse(source) })

  return resolveInfo!
}
