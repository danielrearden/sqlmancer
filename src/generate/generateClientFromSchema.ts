import _ from 'lodash'
import {
  isEnumType,
  isScalarType,
  GraphQLBoolean,
  GraphQLCompositeType,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLSchema,
  GraphQLString,
  GraphQLType,
} from 'graphql'
import { getArgumentValues } from 'graphql/execution/values'
import { GraphQLJSON, GraphQLJSONObject } from '../scalars'
import { Writable } from 'stream'

import {
  getModelDetails,
  getDirectiveArguments,
  getDirectiveByName,
  isCustomScalar,
  makeNullable,
  unwrap,
} from '../graphqlUtilities'
import { Dialect, FieldNameTransformation } from '../types'

const libraryPath = process.env.SQLMANCER_PATH || 'sqlmancer'

export function generateClientFromSchema(schema: GraphQLSchema, stream: Writable): void {
  const sqlmancerDirective = getDirectiveByName(schema.getQueryType(), 'sqlmancer')

  if (!sqlmancerDirective) {
    throw new Error(
      'Unable to parse Sqlmancer configuration from type definitions. Did you include the @sqlmancer directive on your Query type?'
    )
  }

  const options = getDirectiveArguments(sqlmancerDirective, schema)!
  const dialect = _.lowerCase(options.dialect) as Dialect
  const transformFieldNames = options.transformFieldNames as FieldNameTransformation

  stream.write(`
import Knex from 'knex'
import {
  BuilderOptions,
  CreateManyBuilder,
  CreateOneBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  FindByIdBuilder,
  FindManyBuilder,
  FindOneBuilder,
  Models,
  UpdateByIdBuilder,
  UpdateManyBuilder
} from '${libraryPath}'

export type JSON = boolean | number | string | null | JSONArray | JSONMap
export interface JSONMap {
  [key: string]: JSON
}
export type JSONArray = Array<JSON>

export const models: Models = {`)

  const models = getModels(schema).map(model => {
    const modelDirective = getDirectiveByName(model, 'model')!
    const { table, pk, include } = getArgumentValues(schema.getDirective('model')!, modelDirective)
    const details = getModelDetails(model, schema)
    return {
      ...model,
      details,
      tableName: table,
      primaryKey: pk,
      include,
    }
  })

  models.forEach(({ name, tableName, primaryKey, include, details: { fields, joins, dependencies } }) => {
    stream.write(
      `
  ${name}: {
    tableName: '${tableName}',
    primaryKey: '${primaryKey}',
    fields: {\n${fields
      .map(
        ({ fieldName, columnName, hasDefault }) => `      ${fieldName}: {
        column: '${columnName || transformFieldName(fieldName, transformFieldNames)}',${
          hasDefault ? '\n        hasDefault: true,\n' : ''
        }
      },`
      )
      .join('\n')}
    },
    include: ${JSON.stringify(include || [])},
    dependencies: {\n${dependencies
      .map(({ fieldName, columns }) => `      ${fieldName}: [${columns.map(col => `'${col}'`).join(', ')}],`)
      .join('\n')}
    },
    associations: {\n${joins
      .map(({ fieldName, type, on, through }) => {
        const isList = makeNullable(type) instanceof GraphQLList
        const associationType = unwrap(type)

        const isModel = !!models.find(model => model.name === associationType.name)
        if (!isModel) {
          throw new Error(
            `The @join directive was used on ${name}.${fieldName} but the type ${associationType.name} is not a model.`
          )
        }

        return `      ${fieldName}: {
        modelName: '${associationType.name}',
        isMany: ${isList},
        on: [\n${on
          .map(
            ({ from, to }) => `          {
            from: '${from}',
            to: '${to}',
          },`
          )
          .join('\n')}
        ],
        through: ${through ? `'${through}'` : 'undefined'},
        builder: options => new ${associationType.name}Find${isList ? 'Many' : 'One'}Builder(options),
      },`
      })
      .join('\n')}
    },
  },`
    )
  })

  stream.write('\n}\n')

  models.forEach(({ name, primaryKey, details: { fields, joins } }) => {
    const enums: Record<string, GraphQLEnumType> = {}

    stream.write(`
export type ${name}Fields = {\n${fields
      .map(({ fieldName, type }) => `  ${getFieldProperty(fieldName, type, enums)}`)
      .join('\n')}
}
    `)

    const idFields = fields.filter(({ type }) => unwrap(type) === GraphQLID)
    stream.write(`
export type ${name}Ids = ${idFields.length ? idFields.map(({ fieldName }) => `'${fieldName}'`).join(' | ') : 'unknown'}
    `)

    const enumNames = Object.keys(enums)
    stream.write(`
export type ${name}Enums = ${enumNames.length ? enumNames.join(' | ') : 'unknown'}
    `)

    stream.write(`
export type ${name}Associations = {\n${joins
      .map(({ fieldName, type }) => `  ${getAssociationProperty(fieldName, type)}`)
      .join('\n')}
}
    `)

    stream.write(`
export type ${name}CreateFields = {\n${fields
      .map(
        ({ fieldName, type, hasDefault }) =>
          `  ${getFieldProperty(fieldName, hasDefault ? makeNullable(type) : type, enums)}`
      )
      .join('\n')}
}
    `)

    stream.write(`
export type ${name}UpdateFields = {\n${fields
      .filter(({ fieldName }) => fieldName !== primaryKey)
      .map(({ fieldName, type }) => `  ${getFieldProperty(fieldName, makeNullable(type), enums)}`)
      .join('\n')}
}
    `)

    Object.keys(enums).forEach(enumName => {
      const enumType = enums[enumName]
      stream.write(`
enum ${enumName} {\n${enumType
        .getValues()
        .map(enumValue => `  ${enumValue.name} = ${JSON.stringify(enumValue.value)},`)
        .join('\n')}
}`)
    })

    stream.write(
      `
export class ${name}FindOneBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindOneBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, '${name}', models)
  }
}

export class ${name}FindManyBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions) {
    super(options, '${name}', models)
  }
}

export class ${name}FindByIdBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindByIdBuilder<
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions, pk: number | string) {
    super(options, '${name}', models, pk)
  }
}
      `
    )

    stream.write(`
export class ${name}DeleteManyBuilder extends DeleteManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
> {
  constructor(options: BuilderOptions) {
    super(options, '${name}', models)
  }
}

export class ${name}DeleteByIdBuilder extends DeleteByIdBuilder<${name}Fields, ${name}Ids, ${name}Enums, ${name}Associations> {
  constructor(options: BuilderOptions, pk: number | string) {
    super(options, '${name}', models, pk)
  }
}

export class ${name}CreateManyBuilder extends CreateManyBuilder<${name}CreateFields> {
  constructor(options: BuilderOptions, data: ${name}CreateFields[]) {
    super(options, '${name}', models, data)
  }
}

export class ${name}CreateOneBuilder extends CreateOneBuilder<${name}CreateFields> {
  constructor(options: BuilderOptions, data: ${name}CreateFields) {
    super(options, '${name}', models, data)
  }
}

export class ${name}UpdateManyBuilder extends UpdateManyBuilder<
  '${dialect}',
  ${name}UpdateFields,
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
> {
  constructor(options: BuilderOptions, data: ${name}UpdateFields) {
    super(options, '${name}', models, data)
  }
}

export class ${name}UpdateByIdBuilder extends UpdateByIdBuilder<${name}UpdateFields> {
  constructor(options: BuilderOptions, pk: number | string, data: ${name}UpdateFields) {
    super(options, '${name}', models, pk, data)
  }
}
  `)
  })

  stream.write(`
type SqlmancerClient = {
  raw: Knex.RawBuilder<any>;
  transactionProvider(
    config?: any
  ): () => Promise<Knex.Transaction>;
  transaction(
    transactionScope?: null,
    config?: any
  ): Promise<Knex.Transaction>;
  transaction<T>(
    transactionScope: (trx: Knex.Transaction) => Promise<T> | Promise<T> | void,
    config?: any
  ): Promise<T>;
  initialize(config?: Knex.Config): void;
  destroy(callback: Function): void;
  destroy(): Promise<void>;
  batchInsert(
    tableName: Knex.TableDescriptor,
    data: readonly any[],
    chunkSize?: number
  ): Knex.QueryBuilder<any, {}>;
  schema: Knex.SchemaBuilder;
  queryBuilder<TRecord2 = any, TResult2 = any[]>(): Knex.QueryBuilder<TRecord2, TResult2>;
  client: any;
  migrate: Knex.Migrator;
  seed: Knex.Seeder;
  fn: Knex.FunctionHelper;
  ref: Knex.RefBuilder;
  models: {${models
    .map(
      ({ name }) => `
    ${name}: {
      findById: (id: number | string) => ${name}FindByIdBuilder
      findMany: () => ${name}FindManyBuilder
      findOne: () => ${name}FindOneBuilder
      createMany: (data: ${name}CreateFields[]) => ${name}CreateManyBuilder
      createOne: (data: ${name}CreateFields) => ${name}CreateOneBuilder
      deleteById: (id: number | string) => ${name}DeleteByIdBuilder
      deleteMany: () => ${name}DeleteManyBuilder
      updateById: (id: number | string, data: ${name}UpdateFields) => ${name}UpdateByIdBuilder
      updateMany: (data: ${name}UpdateFields) => ${name}UpdateManyBuilder
    },`
    )
    .join('')}
  },
}

export function createClient (knex: Knex): SqlmancerClient {
  return {
    models: {${models
      .map(
        ({ name }) => `
      ${name}: {
        findById: (id: number | string) => new ${name}FindByIdBuilder({ knex, dialect: '${dialect}' }, id),
        findMany: () => new ${name}FindManyBuilder({ knex, dialect: '${dialect}' }),
        findOne: () => new ${name}FindOneBuilder({ knex, dialect: '${dialect}' }),
        createMany: (data: ${name}CreateFields[]) => new ${name}CreateManyBuilder({ knex, dialect: '${dialect}' }, data),
        createOne: (data: ${name}CreateFields) => new ${name}CreateOneBuilder({ knex, dialect: '${dialect}' }, data),
        deleteById: (id: number | string) => new ${name}DeleteByIdBuilder({ knex, dialect: '${dialect}' }, id),
        deleteMany: () => new ${name}DeleteManyBuilder({ knex, dialect: '${dialect}' }),
        updateById: (id: number | string, data: ${name}UpdateFields) => new ${name}UpdateByIdBuilder({ knex, dialect: '${dialect}' }, id, data),
        updateMany: (data: ${name}UpdateFields) => new ${name}UpdateManyBuilder({ knex, dialect: '${dialect}' }, data),
      },`
      )
      .join('')}
    },
    ...knex,
  }
}
  `)
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

function getFieldProperty(fieldName: string, type: GraphQLType, enums: Record<string, GraphQLEnumType>): string {
  const nullableType = makeNullable(type)
  const unwrappedType = unwrap(type)
  const colon = type instanceof GraphQLNonNull ? ': ' : '?: '
  const brackets = nullableType instanceof GraphQLList ? '[]' : ''
  if (isScalarType(unwrappedType)) {
    let tsType

    if (unwrappedType === GraphQLString) {
      tsType = 'string'
    } else if (unwrappedType === GraphQLInt || unwrappedType === GraphQLFloat) {
      tsType = 'number'
    } else if (unwrappedType === GraphQLBoolean) {
      tsType = 'boolean'
    } else if (unwrappedType === GraphQLID) {
      tsType = '(number | string)'
    } else if (isCustomScalar(unwrappedType, GraphQLJSON) || isCustomScalar(unwrappedType, GraphQLJSONObject)) {
      tsType = 'JSON'
    }
    return tsType ? `${fieldName}${colon}${tsType}${brackets}` : ''
  } else if (isEnumType(unwrappedType)) {
    enums[unwrappedType.name] = unwrappedType
    return `${fieldName}${colon}${unwrappedType.name}${brackets}`
  }
  return ''
}

function getAssociationProperty(associationName: string, type: GraphQLOutputType): string {
  const nullableType = makeNullable(type)
  const isList = nullableType instanceof GraphQLList
  const unwrappedType = unwrap(type)
  return `${associationName}: ${unwrappedType.name}Find${isList ? 'Many' : 'One'}Builder`
}

function getModels(schema: GraphQLSchema) {
  return Object.keys(schema.getTypeMap()).reduce((acc, typeName) => {
    const type = schema.getType(typeName)!
    const modelDirective = getDirectiveByName(type, 'model')
    if (modelDirective) {
      acc.push(type as GraphQLCompositeType)
    }
    return acc
  }, [] as GraphQLCompositeType[])
}
