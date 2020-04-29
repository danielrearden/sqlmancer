import _ from 'lodash'
import { isObjectType, GraphQLCompositeType, GraphQLSchema } from 'graphql'
import { getArgumentValues } from 'graphql/execution/values'

import {
  AggregateBuilder,
  FindByIdBuilder,
  FindOneBuilder,
  FindManyBuilder,
  CreateOneBuilder,
  CreateManyBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  UpdateByIdBuilder,
  UpdateManyBuilder,
} from '../queryBuilder'
import { BuilderOptions, ID, SqlmancerConfig, Model, Models } from '../types'
import { getDirectiveByName } from './getDirectiveByName'
import { parseDirectiveArguments } from './parseDirectiveArguments'
import { getScalarTSType } from './getScalarTSType'

let config: SqlmancerConfig

export function getSqlmancerConfig(schema: GraphQLSchema): SqlmancerConfig {
  if (!config) {
    const sqlmancerDirective = getDirectiveByName(schema.getQueryType(), 'sqlmancer')

    if (!sqlmancerDirective) {
      throw new Error(
        'Unable to parse Sqlmancer configuration from type definitions. Did you include the @sqlmancer directive on your Query type?'
      )
    }

    const args = getArgumentValues(schema.getDirective('sqlmancer')!, sqlmancerDirective)!
    config = {
      ...args.config,
      dialect: _.lowerCase(args.config.dialect),
      models: getModels(schema),
    }
  }

  return config
}

export function getModels(schema: GraphQLSchema): Models {
  const models = Object.keys(schema.getTypeMap()).reduce((acc, typeName) => {
    const type = schema.getType(typeName)! as GraphQLCompositeType
    const modelDirective = getDirectiveByName(type, 'model')
    if (modelDirective) {
      const { table, pk, include } = getArgumentValues(schema.getDirective('model')!, modelDirective)

      const builders = {
        findById: class extends FindByIdBuilder<any, any, any, any> {
          constructor(options: BuilderOptions, pk: ID) {
            super(options, type.name, models, pk)
          }
        },
        findOne: class extends FindOneBuilder<any, any, any, any, any> {
          constructor(options: BuilderOptions) {
            super(options, type.name, models)
          }
        },
        findMany: class extends FindManyBuilder<any, any, any, any, any> {
          constructor(options: BuilderOptions) {
            super(options, type.name, models)
          }
        },
        aggregate: class extends AggregateBuilder<any, any, any, any, any, any> {
          constructor(options: BuilderOptions) {
            super(options, type.name, models)
          }
        },
        createOne: class extends CreateOneBuilder<any> {
          constructor(options: BuilderOptions, data: any) {
            super(options, type.name, models, data)
          }
        },
        createMany: class extends CreateManyBuilder<any> {
          constructor(options: BuilderOptions, data: any[]) {
            super(options, type.name, models, data)
          }
        },
        deleteById: class extends DeleteByIdBuilder<any, any, any, any> {
          constructor(options: BuilderOptions, pk: ID) {
            super(options, type.name, models, pk)
          }
        },
        deleteMany: class extends DeleteManyBuilder<any, any, any, any, any> {
          constructor(options: BuilderOptions) {
            super(options, type.name, models)
          }
        },
        updateById: class extends UpdateByIdBuilder<any> {
          constructor(options: BuilderOptions, pk: ID, data: any) {
            super(options, type.name, models, pk, data)
          }
        },
        updateMany: class extends UpdateManyBuilder<any, any, any, any, any, any> {
          constructor(options: BuilderOptions, data: any) {
            super(options, type.name, models, data)
          }
        },
      }

      Object.defineProperty(builders.findById, 'name', `${type.name}FindByIdBuilder`)
      Object.defineProperty(builders.findOne, 'name', `${type.name}FindOneBuilder`)
      Object.defineProperty(builders.findMany, 'name', `${type.name}FindManyBuilder`)
      Object.defineProperty(builders.aggregate, 'name', `${type.name}AggregateBuilder`)
      Object.defineProperty(builders.createOne, 'name', `${type.name}CreateOneBuilder`)
      Object.defineProperty(builders.createMany, 'name', `${type.name}CreateManyBuilder`)
      Object.defineProperty(builders.deleteById, 'name', `${type.name}DeleteByIdBuilder`)
      Object.defineProperty(builders.deleteMany, 'name', `${type.name}DeleteManyBuilder`)
      Object.defineProperty(builders.updateById, 'name', `${type.name}UpdateByIdBuilder`)
      Object.defineProperty(builders.updateMany, 'name', `${type.name}UpdateManyBuilder`)

      const implementingTypes = isObjectType(type) ? [type] : schema.getPossibleTypes(type)
      const details = implementingTypes.reduce(
        (acc, implementingType) => {
          const fieldMap = implementingType.getFields()
          const fieldNames = Object.keys(fieldMap)
          fieldNames.forEach(fieldName => {
            const field = fieldMap[fieldName]
            const directives = field.astNode!.directives!
            const columnArgs = parseDirectiveArguments(getDirectiveNode('col', directives), schema)
            const associateArgs = parseDirectiveArguments(getDirectiveNode('associate', directives), schema)
            const dependArgs = parseDirectiveArguments(getDirectiveNode('depend', directives), schema)
            const aggArgs = parseDirectiveArguments(getDirectiveNode('agg', directives), schema)
            const ignoreDirective = getDirectiveNode('ignore', directives)
            const hasDefaultDirective = getDirectiveNode('hasDefault', directives)
            if (!ignoreDirective && !associateArgs && !dependArgs) {
              acc.fields[fieldName] = {
                column: '',
                type: getScalarTSType()
                hasDefault: !!hasDefaultDirective,
              }
              acc.fields.push({
                fieldName,
                type: field.type,
                columnName: columnArgs ? columnArgs.name : undefined,
                hasDefault: !!hasDefaultDirective,
              })
            } else if (associateArgs) {
              acc.associations.push({
                fieldName,
                type: field.type,
                on: associateArgs.on,
                through: associateArgs.through,
              })
            } else if (dependArgs) {
              acc.dependencies.push({ fieldName, columns: dependArgs.on })
            } else if (aggArgs) {
              acc.aggregates[fieldName] = aggArgs.association
            }
          })
          return acc
        },
        { fields: {}, associations: {}, dependencies: {}, aggregates: {} } as Pick<
          Model,
          'fields' | 'associations' | 'dependencies' | 'aggregates'
        >
      )

      acc[type.name] = {
        tableName: table,
        primaryKey: pk,
        include: include || [],
        builders,
        ...details,
        // fields: Record<string, Field>
        // dependencies: Record<string, string[]>
        // associations: Record<string, Association>
        // aggregates: Record<string, string>
      }
    }
    return acc
  }, {} as Models)

  return models
}

function getDirectiveNode(name: string, directives: ReadonlyArray<DirectiveNode>) {
  const directive = directives.find(directive => directive.name.value === name)
  return directive || null
}
