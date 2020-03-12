import Knex from 'knex'
import { execute, parse, GraphQLSchema, GraphQLResolveInfo } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'
import { BaseBuilder } from '../../base'
import { BuilderOptions } from '../../types'

export function getRollback(knex: Knex) {
  return async function (builder: BaseBuilder, fn: (result: any) => void) {
    const error = new Error('Rolling back transaction')
    await expect(
      knex.transaction(async trx => {
        const result = await builder.transaction(trx).execute()
        fn(result)
        throw error
      })
    ).rejects.toStrictEqual(error)
  }
}

export function withDialects(
  fn: (options: BuilderOptions, rollback: (builder: BaseBuilder, fn: (result: any) => void) => Promise<void>) => void
) {
  const dialects: [string, Knex][] = [
    [
      'pg',
      Knex({
        client: 'pg',
        connection: 'postgresql://postgres@localhost:5432/sakila',
        debug: true,
      }),
    ],
  ]
  dialects.forEach(([dialect, knex]) => {
    // eslint-disable-next-line jest/valid-title
    describe(dialect, () => {
      fn({ knex }, getRollback(knex))

      afterAll(async () => {
        await knex.destroy()
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
