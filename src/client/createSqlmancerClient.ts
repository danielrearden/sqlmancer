import _ from 'lodash'
import Knex from 'knex'

import {
  AggregateBuilder,
  CreateOneBuilder,
  CreateManyBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  FindByIdBuilder,
  FindOneBuilder,
  FindManyBuilder,
  UpdateByIdBuilder,
  UpdateManyBuilder,
} from '../queryBuilder'
import { getSqlmancerConfig } from '.'
import { makeSqlmancerSchema } from '../directives'
import { ID } from '../types'
import { getTypeDefsFromGlob } from '../generate/getTypeDefsFromGlob'

type GenericSqlmancerClient = Knex & {
  models: Record<
    string,
    {
      findById: (id: ID) => FindByIdBuilder<any, any, any, any, any, any, any>
      findMany: () => FindManyBuilder<any, any, any, any, any, any, any, any>
      findOne: () => FindOneBuilder<any, any, any, any, any, any, any, any>
      aggregate: () => AggregateBuilder<any, any, any, any, any, any>
      createMany?: (input: Array<any>) => CreateManyBuilder<any>
      createOne?: (input: any) => CreateOneBuilder<any>
      deleteById?: (id: ID) => DeleteByIdBuilder
      deleteMany?: () => DeleteManyBuilder<any, any, any, any, any>
      updateById?: (id: ID, input: any) => UpdateByIdBuilder<any>
      updateMany?: (input: any) => UpdateManyBuilder<any, any, any, any, any, any>
    }
  >
}

export function createSqlmancerClient<T extends GenericSqlmancerClient = GenericSqlmancerClient>(
  glob: string,
  knex: Knex
): T {
  const typeDefs = getTypeDefsFromGlob(glob)

  if (!typeDefs || !typeDefs.definitions.length) {
    throw new Error(`Found no files with valid type definitions using glob pattern "${glob}"`)
  }

  const schema = makeSqlmancerSchema({ typeDefs })
  const { dialect, models } = getSqlmancerConfig(schema)

  return Object.assign(knex, {
    models: _.mapValues(models, model => {
      const options = { knex, dialect }
      const { builders, readOnly } = model
      return {
        findById: (id: ID) => new builders.findById(options, id),
        findMany: () => new builders.findMany(options),
        findOne: () => new builders.findOne(options),
        aggregate: () => new builders.aggregate(options),
        createOne: readOnly ? undefined : (input: any) => new builders.createOne!(options, input),
        createMany: readOnly ? undefined : (input: Array<any>) => new builders.createMany!(options, input),
        deleteById: readOnly ? undefined : (id: ID) => new builders.deleteById!(options, id),
        deleteMany: readOnly ? undefined : () => new builders.deleteMany!(options),
        updateById: readOnly ? undefined : (id: ID, input: any) => new builders.updateById!(options, id, input),
        updateMany: readOnly ? undefined : (input: any) => new builders.updateMany!(options, input),
      }
    }),
  }) as any
}
