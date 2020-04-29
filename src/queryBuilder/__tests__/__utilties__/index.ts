import Knex from 'knex'
import { execute, parse, GraphQLSchema, GraphQLResolveInfo } from 'graphql'
import { applyMiddleware } from 'graphql-middleware'
import { BaseBuilder } from '../../base'
import { BuilderOptions } from '../../../types'
import { dialects } from '../../../__tests__/knex'

export function getRollback(knex: Knex) {
  return async function(builder: BaseBuilder, fn: (result: any) => void) {
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
  dialects.forEach(({ name, knex }) => {
    // eslint-disable-next-line jest/valid-title
    describe(name, () => {
      fn({ knex, dialect: name as any }, getRollback(knex))

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
