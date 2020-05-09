import { isEnumType, GraphQLEnumType, GraphQLSchema, isNonNullType } from 'graphql'
import { Writable } from 'stream'

import { unwrap } from '../utilities'
import { getSqlmancerConfig } from '../client'

export function generateClientTypeDeclarations(schema: GraphQLSchema, stream: Writable): void {
  const { dialect, models } = getSqlmancerConfig(schema)

  stream.write(`import Knex from 'knex';
import {
  AggregateBuilder,
  CreateManyBuilder,
  CreateOneBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  FindByIdBuilder,
  FindManyBuilder,
  FindOneBuilder,
  UpdateByIdBuilder,
  UpdateManyBuilder
} from 'sqlmancer';

export type ID = number | string;
export type JSON = boolean | number | string | null | JSONArray | JSONObject;
export interface JSONObject {
  [key: string]: JSON;
}
export type JSONArray = Array<JSON>;
`)

  let allEnums: Record<string, GraphQLEnumType> = {}

  Object.keys(models).forEach((name) => {
    const { primaryKey, fields, associations } = models[name]

    stream.write(`
export type ${name}Fields = {\n${Object.keys(fields)
      .map((fieldName) => `  ${fieldName}: ${getOutputFieldType(fields[fieldName].mappedType)};`)
      .join('\n')}
}
    `)

    const idFields = Object.keys(fields).filter((fieldName) => fields[fieldName].mappedType === 'ID')
    stream.write(`
export type ${name}Ids = ${idFields.length ? idFields.map((fieldName) => `'${fieldName}'`).join(' | ') : 'unknown'};
    `)

    const enums = Object.keys(fields).reduce((acc, fieldName) => {
      const field = fields[fieldName]
      const unwrappedType = unwrap(field.type)
      if (isEnumType(unwrappedType)) {
        acc[unwrappedType.name] = unwrappedType
      }
      return acc
    }, {} as Record<string, GraphQLEnumType>)
    allEnums = { ...enums, ...allEnums }
    stream.write(`
export type ${name}Enums = ${Object.keys(enums).length ? Object.keys(enums).join(' | ') : 'unknown'};
    `)

    stream.write(`
export type ${name}Associations = {\n${Object.keys(associations)
      .map(
        (name) =>
          `  ${name}: [${associations[name].modelName}Find${associations[name].isMany ? 'Many' : 'One'}Builder, ${
            associations[name].modelName
          }AggregateBuilder];`
      )
      .join('\n')}
}
    `)

    stream.write(`
export type ${name}CreateFields = {\n${Object.keys(fields)
      .map((fieldName) => {
        const field = fields[fieldName]
        const required = isNonNullType(field.type) && !field.hasDefault
        return `  ${fieldName}${required ? '' : '?'}: ${getInputFieldType(field.mappedType)};`
      })
      .join('\n')}
};
    `)

    stream.write(`
export type ${name}UpdateFields = {\n${Object.keys(fields)
      .filter((fieldName) => fields[fieldName].column !== primaryKey)
      .map((fieldName) => `  ${fieldName}?: ${getInputFieldType(fields[fieldName].mappedType)};`)
      .join('\n')}
};
    `)

    stream.write(
      `
export type ${name}FindOneBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> = FindOneBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
>

export type ${name}FindManyBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> = FindManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
>

export type ${name}FindByIdBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> = FindByIdBuilder<
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
>

export type ${name}AggregateBuilder = AggregateBuilder<'${dialect}', ${name}Fields, ${name}Ids, ${name}Enums, ${name}Associations>
      `
    )

    stream.write(`
export type ${name}DeleteManyBuilder = DeleteManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
>

export type ${name}DeleteByIdBuilder = DeleteByIdBuilder

export type ${name}CreateManyBuilder = CreateManyBuilder<${name}CreateFields>

export type ${name}CreateOneBuilder = CreateOneBuilder<${name}CreateFields>

export type ${name}UpdateManyBuilder = UpdateManyBuilder<
  '${dialect}',
  ${name}UpdateFields,
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
>

export type ${name}UpdateByIdBuilder = UpdateByIdBuilder<${name}UpdateFields>
  `)
  })

  Object.keys(allEnums).forEach((enumName) => {
    const enumType = allEnums[enumName]
    stream.write(`
export enum ${enumName} {\n${enumType
      .getValues()
      .map((enumValue) => `  ${enumValue.name} = ${JSON.stringify(enumValue.value)},`)
      .join('\n')}
}`)
  })

  stream.write(`
export type SqlmancerClient = Knex & {
  models: {${Object.keys(models)
    .map((name) => {
      const { readOnly } = models[name]
      return `
    ${name}: {
      findById: (id: ID) => ${name}FindByIdBuilder;
      findMany: () => ${name}FindManyBuilder;
      findOne: () => ${name}FindOneBuilder;
      aggregate: () => ${name}AggregateBuilder;${
        readOnly
          ? ''
          : `
      createMany: (input: ${name}CreateFields[]) => ${name}CreateManyBuilder;
      createOne: (input: ${name}CreateFields) => ${name}CreateOneBuilder;
      deleteById: (id: ID) => ${name}DeleteByIdBuilder;
      deleteMany: () => ${name}DeleteManyBuilder;
      updateById: (id: ID, input: ${name}UpdateFields) => ${name}UpdateByIdBuilder;
      updateMany: (input: ${name}UpdateFields) => ${name}UpdateManyBuilder;`
      }
    };`
    })
    .join('')}
  };
};
  `)
}

function getOutputFieldType(mappedType: string) {
  switch (mappedType) {
    case 'Date':
      return 'string'
    case 'Date[]':
      return 'string[]'
    default:
      return mappedType
  }
}

function getInputFieldType(mappedType: string) {
  switch (mappedType) {
    case 'Date':
      return 'Date | string'
    case 'Date[]':
      return 'Date[] | string[]'
    default:
      return mappedType
  }
}
