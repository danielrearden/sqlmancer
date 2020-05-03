import { isEnumType, GraphQLEnumType, GraphQLSchema, isNonNullType } from 'graphql'
import { Writable } from 'stream'

import { getSqlmancerConfig, unwrap } from '../utilities'

export function generateClientTypeDeclarations(schema: GraphQLSchema, stream: Writable): void {
  const { dialect, models } = getSqlmancerConfig(schema)

  stream.write(`
import Knex from 'knex';
import {
  AggregateBuilder,
  BuilderOptions,
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

export declare type ID = number | string;
export declare type JSON = boolean | number | string | null | JSONArray | JSONObject;
export interface JSONObject {
  [key: string]: JSON;
}
export declare type JSONArray = Array<JSON>;
`)

  Object.keys(models).forEach(name => {
    const { primaryKey, fields, associations } = models[name]

    stream.write(`
export declare type ${name}Fields = {\n${Object.keys(fields)
      .map(fieldName => `  ${fieldName}: ${getOutputFieldType(fields[fieldName].mappedType)};`)
      .join('\n')}
}
    `)

    const idFields = Object.keys(fields).filter(fieldName => fields[fieldName].mappedType === 'ID')
    stream.write(`
export declare type ${name}Ids = ${
      idFields.length ? idFields.map(fieldName => `'${fieldName}'`).join(' | ') : 'unknown'
    };
    `)

    const enums = Object.keys(fields).reduce((acc, fieldName) => {
      const field = fields[fieldName]
      const unwrappedType = unwrap(field.type)
      if (isEnumType(unwrappedType)) {
        acc[unwrappedType.name] = unwrappedType
      }
      return acc
    }, {} as Record<string, GraphQLEnumType>)
    stream.write(`
export declare type ${name}Enums = ${Object.keys(enums).length ? Object.keys(enums).join(' | ') : 'unknown'};
    `)

    stream.write(`
export declare type ${name}Associations = {\n${Object.keys(associations)
      .map(
        name =>
          `  ${name}: [${associations[name].modelName}Find${associations[name].isMany ? 'Many' : 'One'}Builder, ${
            associations[name].modelName
          }AggregateBuilder];`
      )
      .join('\n')}
}
    `)

    stream.write(`
export declare type ${name}CreateFields = {\n${Object.keys(fields)
      .map(fieldName => {
        const field = fields[fieldName]
        const required = isNonNullType(field.type) && !field.hasDefault
        return `  ${fieldName}${required ? '' : '?'}: ${getInputFieldType(field.mappedType)};`
      })
      .join('\n')}
};
    `)

    stream.write(`
export declare type ${name}UpdateFields = {\n${Object.keys(fields)
      .filter(fieldName => fields[fieldName].column !== primaryKey)
      .map(fieldName => `  ${fieldName}?: ${getInputFieldType(fields[fieldName].mappedType)};`)
      .join('\n')}
};
    `)

    Object.keys(enums).forEach(enumName => {
      const enumType = enums[enumName]
      stream.write(`
export declare enum ${enumName} {\n${enumType
        .getValues()
        .map(enumValue => `  ${enumValue.name} = ${JSON.stringify(enumValue.value)},`)
        .join('\n')}
}`)
    })

    stream.write(
      `
export declare class ${name}FindOneBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindOneBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions);
}

export declare class ${name}FindManyBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions);
}

export declare class ${name}FindByIdBuilder<TSelected extends Pick<${name}Fields, any> = ${name}Fields> extends FindByIdBuilder<
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations,
  TSelected
> {
  constructor(options: BuilderOptions, pk: ID);
}

export declare class ${name}AggregateBuilder<
  TSelected extends Pick<${name}Fields, any> = ${name}Fields
> extends AggregateBuilder<'postgres', ${name}Fields, ${name}Ids, ${name}Enums, ${name}Associations> {
  constructor(options: BuilderOptions);
}
      `
    )

    stream.write(`
export declare class ${name}DeleteManyBuilder extends DeleteManyBuilder<
  '${dialect}',
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
> {
  constructor(options: BuilderOptions);
}

export declare class ${name}DeleteByIdBuilder extends DeleteByIdBuilder {
  constructor(options: BuilderOptions, pk: ID);
}

export declare class ${name}CreateManyBuilder extends CreateManyBuilder<${name}CreateFields> {
  constructor(options: BuilderOptions, data: ${name}CreateFields[]);
}

export declare class ${name}CreateOneBuilder extends CreateOneBuilder<${name}CreateFields> {
  constructor(options: BuilderOptions, data: ${name}CreateFields);
}

export declare class ${name}UpdateManyBuilder extends UpdateManyBuilder<
  '${dialect}',
  ${name}UpdateFields,
  ${name}Fields,
  ${name}Ids,
  ${name}Enums,
  ${name}Associations
> {
  constructor(options: BuilderOptions, data: ${name}UpdateFields);
}

export declare class ${name}UpdateByIdBuilder extends UpdateByIdBuilder<${name}UpdateFields> {
  constructor(options: BuilderOptions, pk: ID, data: ${name}UpdateFields);
}
  `)
  })

  stream.write(`
type SqlmancerClient = Knex & {
  models: {${Object.keys(models)
    .map(name => {
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
