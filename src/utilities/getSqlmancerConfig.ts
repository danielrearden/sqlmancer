import _ from 'lodash'
import { isListType, isObjectType, DirectiveNode, GraphQLCompositeType, GraphQLSchema, isEnumType } from 'graphql'
import { getArgumentValues } from 'graphql/execution/values'

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
import {
  BuilderOptions,
  Dialect,
  FieldNameTransformation,
  ID,
  Model,
  Models,
  PossibleScalarTypes,
  SqlmancerConfig,
} from '../types'
import { getDirectiveByName } from './getDirectiveByName'
import { unwrap } from './unwrap'
import { makeNullable } from './makeNullable'

export function getSqlmancerConfig(schema: GraphQLSchema): SqlmancerConfig {
  const sqlmancerDirective = getDirectiveByName(schema.getQueryType(), 'sqlmancer')

  if (!sqlmancerDirective) {
    throw new Error(
      'Unable to parse Sqlmancer configuration from type definitions. Did you include the @sqlmancer directive on your Query type?'
    )
  }

  const args = getArgumentValues(schema.getDirective('sqlmancer')!, sqlmancerDirective)!
  const customScalarMap = getScalarMap(args.customScalars)
  const dialect = _.lowerCase(args.dialect) as Dialect
  return {
    ...args,
    dialect,
    models: getModels(schema, dialect, args.transformFieldNames, customScalarMap),
    customScalarMap,
  }
}

function getScalarMap(customScalars?: { string?: string[]; number?: string[]; boolean?: string[]; JSON?: string[] }) {
  const baseScalars = {
    string: ['String'],
    number: ['Int', 'Float'],
    boolean: ['Boolean'],
    JSON: [],
    ID: ['ID'],
  }
  const scalarsByType = _.mergeWith({}, baseScalars, customScalars, (obj, src) => {
    if (Array.isArray(obj)) {
      return obj.concat(src)
    }
  }) as Record<string, string[]>
  return Object.keys(scalarsByType).reduce((acc, tsType) => {
    if (tsType === 'string' || tsType === 'number' || tsType === 'boolean' || tsType === 'JSON' || tsType === 'ID') {
      scalarsByType[tsType].forEach(scalarName => {
        acc[scalarName] = tsType
      })
    }
    return acc
  }, {} as Record<string, PossibleScalarTypes>)
}

export function getModels(
  schema: GraphQLSchema,
  dialect: Dialect,
  transformFieldNames: FieldNameTransformation | undefined,
  customScalarMap: Record<string, PossibleScalarTypes>
): Models {
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
        deleteById: class extends DeleteByIdBuilder {
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

      Object.defineProperty(builders.findById, 'name', { value: `${type.name}FindByIdBuilder` })
      Object.defineProperty(builders.findOne, 'name', { value: `${type.name}FindOneBuilder` })
      Object.defineProperty(builders.findMany, 'name', { value: `${type.name}FindManyBuilder` })
      Object.defineProperty(builders.aggregate, 'name', { value: `${type.name}AggregateBuilder` })
      Object.defineProperty(builders.createOne, 'name', { value: `${type.name}CreateOneBuilder` })
      Object.defineProperty(builders.createMany, 'name', { value: `${type.name}CreateManyBuilder` })
      Object.defineProperty(builders.deleteById, 'name', { value: `${type.name}DeleteByIdBuilder` })
      Object.defineProperty(builders.deleteMany, 'name', { value: `${type.name}DeleteManyBuilder` })
      Object.defineProperty(builders.updateById, 'name', { value: `${type.name}UpdateByIdBuilder` })
      Object.defineProperty(builders.updateMany, 'name', { value: `${type.name}UpdateManyBuilder` })

      const implementingTypes = isObjectType(type) ? [type] : schema.getPossibleTypes(type)
      acc[type.name] = implementingTypes.reduce(
        (acc, implementingType) => {
          const fieldMap = implementingType.getFields()
          const fieldNames = Object.keys(fieldMap)
          fieldNames.forEach(fieldName => {
            const field = fieldMap[fieldName]
            const directives = field.astNode!.directives!
            const columnDir = getDirectiveNode('col', directives)
            const columnArgs = columnDir && getArgumentValues(schema.getDirective('col')!, columnDir)
            const associateDir = getDirectiveNode('associate', directives)
            const associateArgs = associateDir && getArgumentValues(schema.getDirective('associate')!, associateDir)
            const dependDir = getDirectiveNode('depend', directives)
            const dependArgs = dependDir && getArgumentValues(schema.getDirective('depend')!, dependDir)
            const ignoreDirective = getDirectiveNode('ignore', directives)
            const hasDefaultDirective = getDirectiveNode('hasDefault', directives)
            const unwrappedType = unwrap(field.type)
            const nullableType = makeNullable(field.type)
            const isList = isListType(nullableType)

            if (!ignoreDirective && !associateArgs && !dependArgs) {
              const mappedType = isEnumType(nullableType)
                ? nullableType.name
                : dialect === 'postgres' && isEnumType(unwrappedType) && isList
                ? unwrappedType.name + '[]'
                : dialect === 'postgres' && isList && customScalarMap[unwrappedType.name]
                ? customScalarMap[unwrappedType.name] + '[]'
                : customScalarMap[nullableType.name]

              if (mappedType) {
                acc.fields[fieldName] = {
                  column: (columnArgs && columnArgs.name) || transformFieldName(fieldName, transformFieldNames),
                  mappedType,
                  type: field.type,
                  hasDefault: !!hasDefaultDirective,
                }
              }
            } else if (associateArgs) {
              if (associateArgs.aggregate) {
                // TODO: Assert valid association field name
                acc.aggregates[fieldName] = associateArgs.aggregate
              } else {
                // TODO: Assert type is model
                acc.associations[fieldName] = {
                  modelName: unwrappedType.name,
                  isMany: isList,
                  on: associateArgs.on,
                  through: associateArgs.through,
                }
              }
            } else if (dependArgs) {
              acc.dependencies[fieldName] = dependArgs.on
            }
          })
          return acc
        },
        {
          tableName: table,
          primaryKey: pk,
          include: include || [],
          builders,
          fields: {},
          dependencies: {},
          associations: {},
          aggregates: {},
        } as Model
      )
    }
    return acc
  }, {} as Models)

  return models
}

function getDirectiveNode(name: string, directives: ReadonlyArray<DirectiveNode>) {
  const directive = directives.find(directive => directive.name.value === name)
  return directive || null
}

function transformFieldName(fieldName: string, transformation?: FieldNameTransformation) {
  switch (transformation) {
    case 'CAMEL_CASE':
      return _.camelCase(fieldName)
    case 'PASCAL_CASE':
      return _.upperFirst(_.camelCase(fieldName))
    case 'SNAKE_CASE':
      return _.snakeCase(fieldName)
    default:
      return fieldName
  }
}
