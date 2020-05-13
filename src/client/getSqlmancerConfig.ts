import _ from 'lodash'
import { isListType, isObjectType, GraphQLCompositeType, GraphQLSchema, isEnumType } from 'graphql'
import { getDirectives } from '@graphql-toolkit/common'

import {
  CreateOneBuilder,
  CreateManyBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  FindByIdBuilder,
  FindOneBuilder,
  FindManyBuilder,
  PaginateBuilder,
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
import { unwrap } from '../utilities/unwrap'
import { makeNullable } from '../utilities/makeNullable'
import { assertValidSqlmancerConfig } from './assertValidSqlmancerConfig'

const cache = new WeakMap()

export function getSqlmancerConfig(schema: GraphQLSchema): SqlmancerConfig {
  const cached = cache.get(schema)
  if (cached) {
    return cached
  }

  const { sqlmancer: sqlmancerDirective } = getDirectives(schema, schema.getQueryType())

  if (!sqlmancerDirective) {
    throw new Error(
      'Unable to parse Sqlmancer configuration from type definitions. Did you include the @sqlmancer directive on your Query type?'
    )
  }

  const customScalarMap = getScalarMap(sqlmancerDirective.customScalars)
  const dialect = _.lowerCase(sqlmancerDirective.dialect) as Dialect

  const config = {
    ...sqlmancerDirective,
    dialect,
    models: getModels(schema, dialect, sqlmancerDirective.transformFieldNames, customScalarMap),
    customScalarMap,
  }
  cache.set(schema, config)

  assertValidSqlmancerConfig(config)

  return config
}

function getScalarMap(customScalars?: { string?: string[]; number?: string[]; boolean?: string[]; JSON?: string[] }) {
  const baseScalars = {
    string: ['String'],
    number: ['Int', 'Float'],
    boolean: ['Boolean'],
    JSON: [],
    Date: [],
    ID: ['ID'],
  }
  const scalarsByType = _.mergeWith({}, baseScalars, customScalars, (obj, src) => {
    if (Array.isArray(obj)) {
      return obj.concat(src)
    }
  }) as Record<string, string[]>
  return Object.keys(scalarsByType).reduce((acc, tsType) => {
    if (
      tsType === 'string' ||
      tsType === 'number' ||
      tsType === 'boolean' ||
      tsType === 'JSON' ||
      tsType === 'ID' ||
      tsType === 'Date'
    ) {
      scalarsByType[tsType].forEach((scalarName) => {
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
    const { model: modelDirective } = getDirectives(schema, type)
    if (modelDirective) {
      const { table, cte, pk, include, readOnly } = modelDirective
      const isReadOnly = !!cte || readOnly

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
        paginate: class extends PaginateBuilder<any, any, any, any, any, any, any, any, any> {
          constructor(options: BuilderOptions) {
            super(options, type.name, models)
          }
        },
        createOne: isReadOnly
          ? undefined
          : class extends CreateOneBuilder<any> {
              constructor(options: BuilderOptions, data: any) {
                super(options, type.name, models, data)
              }
            },
        createMany: isReadOnly
          ? undefined
          : class extends CreateManyBuilder<any> {
              constructor(options: BuilderOptions, data: any[]) {
                super(options, type.name, models, data)
              }
            },
        deleteById: isReadOnly
          ? undefined
          : class extends DeleteByIdBuilder {
              constructor(options: BuilderOptions, pk: ID) {
                super(options, type.name, models, pk)
              }
            },
        deleteMany: isReadOnly
          ? undefined
          : class extends DeleteManyBuilder<any, any, any, any, any> {
              constructor(options: BuilderOptions) {
                super(options, type.name, models)
              }
            },
        updateById: isReadOnly
          ? undefined
          : class extends UpdateByIdBuilder<any> {
              constructor(options: BuilderOptions, pk: ID, data: any) {
                super(options, type.name, models, pk, data)
              }
            },
        updateMany: isReadOnly
          ? undefined
          : class extends UpdateManyBuilder<any, any, any, any, any, any> {
              constructor(options: BuilderOptions, data: any) {
                super(options, type.name, models, data)
              }
            },
      }

      Object.defineProperty(builders.findById, 'name', { value: `${type.name}FindByIdBuilder` })
      Object.defineProperty(builders.findOne, 'name', { value: `${type.name}FindOneBuilder` })
      Object.defineProperty(builders.findMany, 'name', { value: `${type.name}FindManyBuilder` })
      Object.defineProperty(builders.paginate, 'name', { value: `${type.name}PaginateBuilder` })
      if (!isReadOnly) {
        Object.defineProperty(builders.createOne, 'name', { value: `${type.name}CreateOneBuilder` })
        Object.defineProperty(builders.createMany, 'name', { value: `${type.name}CreateManyBuilder` })
        Object.defineProperty(builders.deleteById, 'name', { value: `${type.name}DeleteByIdBuilder` })
        Object.defineProperty(builders.deleteMany, 'name', { value: `${type.name}DeleteManyBuilder` })
        Object.defineProperty(builders.updateById, 'name', { value: `${type.name}UpdateByIdBuilder` })
        Object.defineProperty(builders.updateMany, 'name', { value: `${type.name}UpdateManyBuilder` })
      }

      const implementingTypes = isObjectType(type) ? [type] : schema.getPossibleTypes(type)
      acc[type.name] = implementingTypes.reduce(
        (acc, implementingType) => {
          const fieldMap = implementingType.getFields()
          const fieldNames = Object.keys(fieldMap)
          fieldNames.forEach((fieldName) => {
            const field = fieldMap[fieldName]
            const { col, relate, depend, ignore, hasDefault } = getDirectives(schema, field)

            const unwrappedType = unwrap(field.type)
            const nullableType = makeNullable(field.type)
            const isList = isListType(nullableType)

            if (!ignore && !relate && !depend) {
              const mappedType = isEnumType(nullableType)
                ? nullableType.name
                : dialect === 'postgres' && isEnumType(unwrappedType) && isList
                ? unwrappedType.name + '[]'
                : dialect === 'postgres' && isList && customScalarMap[unwrappedType.name]
                ? customScalarMap[unwrappedType.name] + '[]'
                : customScalarMap[nullableType.name]

              if (mappedType) {
                acc.fields[fieldName] = {
                  column: (col && col.name) || transformFieldName(fieldName, transformFieldNames),
                  mappedType,
                  type: field.type,
                  hasDefault: !!hasDefault,
                }
              }
            } else if (relate) {
              // TODO: Assert type is model
              acc.associations[fieldName] = {
                modelName: unwrappedType.name,
                isMany: isList,
                on: relate.on,
                through: relate.through,
                pagination: relate.pagination,
              }
            } else if (depend) {
              acc.dependencies[fieldName] = depend.on
            }
          })
          return acc
        },
        {
          tableName: table,
          cte,
          readOnly: isReadOnly,
          primaryKey: pk,
          include: include || [],
          builders,
          fields: {},
          dependencies: {},
          associations: {},
        } as Model
      )
    }
    return acc
  }, {} as Models)

  return models
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
