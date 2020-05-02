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
import { getSqlmancerConfig } from '../utilities'
import { makeSqlmancerSchema } from '../directives'
import { ID } from '../types'
import { getTypeDefsFromGlob } from './getTypeDefsFromGlob'

type GenericSqlmancerClient = Knex & {
  models: Record<
    string,
    {
      findById: (id: ID) => FindByIdBuilder<any, any, any, any, any, any, any>
      findMany: () => FindManyBuilder<any, any, any, any, any, any, any, any>
      findOne: () => FindOneBuilder<any, any, any, any, any, any, any, any>
      aggregate: () => AggregateBuilder<any, any, any, any, any, any>
      createMany: (input: Array<any>) => CreateManyBuilder<any>
      createOne: (input: any) => CreateOneBuilder<any>
      deleteById: (id: ID) => DeleteByIdBuilder
      deleteMany: () => DeleteManyBuilder<any, any, any, any, any>
      updateById: (id: ID, input: any) => UpdateByIdBuilder<any>
      updateMany: (input: any) => UpdateManyBuilder<any, any, any, any, any, any>
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
      return {
        findById: (id: ID) => new model.builders.findById(options, id),
        findMany: () => new model.builders.findMany(options),
        findOne: () => new model.builders.findOne(options),
        aggregate: () => new model.builders.aggregate(options),
        createOne: (input: any) => new model.builders.createOne(options, input),
        createMany: (input: Array<any>) => new model.builders.createMany(options, input),
        deleteById: (id: ID) => new model.builders.deleteById(options, id),
        deleteMany: () => new model.builders.deleteMany(options),
        updateById: (id: ID, input: any) => new model.builders.updateById(options, id, input),
        updateMany: (input: any) => new model.builders.updateMany(options, input),
      }
    }),
  }) as any
}
