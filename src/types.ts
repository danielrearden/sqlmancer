import Knex = require('knex')
import {
  FindBuilder,
  FindByIdBuilder,
  FindOneBuilder,
  FindManyBuilder,
  CreateOneBuilder,
  CreateManyBuilder,
  DeleteByIdBuilder,
  DeleteManyBuilder,
  PaginateBuilder,
  UpdateByIdBuilder,
  UpdateManyBuilder,
} from './queryBuilder'
import { GraphQLOutputType } from 'graphql'

export type ID = number | string

export type SqlmancerConfig = {
  dialect: Dialect
  transformFieldNames?: FieldNameTransformation
  customScalarMap: Record<string, PossibleScalarTypes>
  models: Models
}

export type Dialect = 'postgres' | 'mysql' | 'mariadb' | 'sqlite'

export type FieldNameTransformation = 'CAMEL_CASE' | 'PASCAL_CASE' | 'SNAKE_CASE'

export type PossibleScalarTypes = 'string' | 'number' | 'boolean' | 'JSON' | 'Date' | 'ID'

export type Models = Record<string, Model>

export type Model = {
  tableName?: string
  cte?: string
  readOnly: boolean
  primaryKey: string
  fields: Record<string, Field>
  include: string[]
  dependencies: Record<string, string[]>
  associations: Record<string, Association>
  builders: {
    findById: new (...args: any[]) => FindByIdBuilder<any, any, any, any, any, any, any>
    findOne: new (...args: any[]) => FindOneBuilder<any, any, any, any, any, any, any, any>
    findMany: new (...args: any[]) => FindManyBuilder<any, any, any, any, any, any, any, any>
    paginate: new (...args: any[]) => PaginateBuilder<any, any, any, any, any, any>
    createOne?: new (...args: any[]) => CreateOneBuilder<any>
    createMany?: new (...args: any[]) => CreateManyBuilder<any>
    deleteById?: new (...args: any[]) => DeleteByIdBuilder
    deleteMany?: new (...args: any[]) => DeleteManyBuilder<any, any, any, any, any>
    updateById?: new (...args: any[]) => UpdateByIdBuilder<any>
    updateMany?: new (...args: any[]) => UpdateManyBuilder<any, any, any, any, any, any>
  }
}

export type Field = {
  column: string
  mappedType: string
  type: GraphQLOutputType
  hasDefault: boolean
  isPrivate: boolean
}

export type Association = {
  modelName: string
  isMany: boolean
  isPrivate: boolean
  on: { from: string; to: string }[]
  through?: string
  pagination?: 'offset'
}

export type BuilderOptions = {
  knex: Knex
  dialect: Dialect
  pubSub?: any
}

export type QueryBuilderContext = {
  alias: Record<string, number>
  nested?: {
    outerAlias: string
    association: Association
  }
}

export type JoinTypes =
  | 'innerJoin'
  | 'leftJoin'
  | 'leftOuterJoin'
  | 'rightJoin'
  | 'rightOuterJoin'
  | 'outerJoin'
  | 'fullOuterJoin'
  | 'crossJoin'

export type WhereArgs =
  | [Knex.Raw]
  | [Knex.QueryCallback]
  | [Record<string, any>]
  | [string, Knex.Value | null]
  | [string, string, Knex.Value | null]
  | [string, string, Knex.QueryBuilder]
  | [Knex.Raw, string, Knex.Value | null]
  | [Knex.Raw, string, Knex.QueryBuilder]

export type Expressions = {
  select: Record<string, string | Knex.Raw | Knex.QueryBuilder>
  join: {
    type: JoinTypes
    table: Knex.QueryBuilder | Record<string, string>
    on: Knex.Raw | Record<string, string>
  }[]
  where: WhereArgs[]
  groupBy: string[]
  orderBy: { column: string | Knex.QueryBuilder; order: string }[]
}

export type JSON = boolean | number | string | null | JSONArray | JSONObject
export interface JSONObject {
  [key: string]: JSON
}
export type JSONArray = Array<JSON>

export type AggregateFields = {
  sum: number
  avg: number
  min: number | string
  max: number | string
}

export type AggregateFunction = keyof AggregateFields

export type AggregateNumberFields<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T]

export type AggregateStringOrNumberFields<T> = { [K in keyof T]: T[K] extends string | number ? K : never }[keyof T]

export type Aggregates<TFields> = (
  | { fn: 'count' }
  | { fn: 'avg'; field: AggregateNumberFields<TFields> }
  | { fn: 'sum'; field: AggregateNumberFields<TFields> }
  | { fn: 'min'; field: AggregateStringOrNumberFields<TFields> }
  | { fn: 'max'; field: AggregateStringOrNumberFields<TFields> }
)[]

export type OrderByDirection = 'ASC' | 'DESC'

export type OrderBy<
  TFields extends Record<string, any>,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
  > = OrderByField<TFields> & OrderByAssociation<TAssociations>

export type OrderByField<TFields extends Record<string, any>> = {
  [Key in keyof TFields]?: OrderByDirection
}

export type OrderByAssociation<
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
  > = {
    [Key in keyof TAssociations]?: TAssociations[Key][0] extends FindBuilder<
      any,
      infer TFields,
      any,
      any,
      any,
      infer TMany,
      any,
      any,
      any
    >
    ? TMany extends true
    ? {
      [AggKey in keyof AggregateFields]?: {
        [Key in keyof TFields]?: TFields[Key] extends AggregateFields[AggKey] ? OrderByDirection : never
      }
    } & { count?: OrderByDirection }
    : { [Key in keyof TFields]?: OrderByDirection }
    : never
  }

export type Where<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds,
  TEnums,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
  > = WhereFields<TDialect, TFields, TIds, TEnums> &
  WhereAssociations<TAssociations> &
  WhereLogicOperators<TDialect, TFields, TIds, TEnums, TAssociations>

export type WhereFields<TDialect extends Dialect, TFields extends Record<string, any>, TIds, TEnums> = {
  [Key in keyof TFields]?: TDialect extends 'postgres'
  ? Key extends TIds
  ? TFields[Key] extends Array<any>
  ? IdArrayOperators
  : IdOperators
  : TFields[Key] extends Array<infer TElement>
  ? TElement extends TEnums
  ? EnumArrayOperators<TFields[Key]>
  : TElement extends boolean
  ? BooleanArrayOperators
  : TElement extends number
  ? NumberArrayOperators
  : TElement extends string
  ? StringArrayOperators
  : never
  : TFields[Key] extends TEnums
  ? EnumOperators<TFields[Key]>
  : TFields[Key] extends boolean
  ? BooleanOperators
  : TFields[Key] extends number
  ? NumberOperators
  : TFields[Key] extends string
  ? PgStringOperators
  : TFields[Key] extends JSON
  ? JsonOperators
  : never
  : TDialect extends 'sqlite'
  ? Key extends TIds
  ? TFields[Key] extends Array<any>
  ? never
  : IdOperators
  : TFields[Key] extends TEnums
  ? EnumOperators<TFields[Key]>
  : TFields[Key] extends boolean
  ? BooleanOperators
  : TFields[Key] extends number
  ? NumberOperators
  : TFields[Key] extends string
  ? StringOperators
  : never
  : Key extends TIds
  ? TFields[Key] extends Array<any>
  ? never
  : IdOperators
  : TFields[Key] extends TEnums
  ? EnumOperators<TFields[Key]>
  : TFields[Key] extends boolean
  ? BooleanOperators
  : TFields[Key] extends number
  ? NumberOperators
  : TFields[Key] extends string
  ? StringOperators
  : TFields[Key] extends JSON
  ? JsonOperators
  : never
}

export type IdOperators = {
  equal?: string | number | null
  notEqual?: string | number | null
  greaterThan?: string | number
  greaterThanOrEqual?: string | number
  lessThan?: string | number
  lessThanOrEqual?: string | number
  in?: (string | number)[]
  notIn?: (string | number)[]
}

export type IdArrayOperators = {
  equal?: string[] | number[] | null
  notEqual?: string[] | number[] | null
  contains?: string[] | number[]
  containedBy?: string[] | number[]
  overlaps?: string[] | number[]
}

export type EnumOperators<T> = {
  equal?: T | null
  notEqual?: T | null
  in?: T[]
  notIn?: T[]
}

export type EnumArrayOperators<T> = {
  equal?: T[] | null
  notEqual?: T[] | null
  contains?: T[]
  containedBy?: T[]
  overlaps?: T[]
}

export type NumberOperators = {
  equal?: number | null
  notEqual?: number | null
  greaterThan?: number
  greaterThanOrEqual?: number
  lessThan?: number
  lessThanOrEqual?: number
  in?: number[]
  notIn?: number[]
}

export type NumberArrayOperators = {
  equal?: number[] | null
  notEqual?: number[] | null
  contains?: number[]
  containedBy?: number[]
  overlaps?: number[]
}

export type StringOperators = {
  equal?: string | null
  notEqual?: string | null
  greaterThan?: string
  greaterThanOrEqual?: string
  lessThan?: string
  lessThanOrEqual?: string
  like?: string
  notLike?: string
  in?: string[]
  notIn?: string[]
}

export type PgStringOperators = StringOperators & {
  iLike?: string
  notILike?: string
}

export type StringArrayOperators = {
  equal?: string[] | null
  notEqual?: string[] | null
  contains?: string[]
  containedBy?: string[]
  overlaps?: string[]
}

export type BooleanOperators = {
  equal?: boolean | null
  notEqual?: boolean | null
}

export type BooleanArrayOperators = {
  equal?: boolean[] | null
  notEqual?: boolean[]
  contains?: boolean[]
  containedBy?: boolean[]
  overlaps?: boolean[]
}

export type JsonOperators = {
  equal?: string | null
  notEqual?: string | null
  contains?: string
  containedBy?: string
  hasKey?: string
  hasAnyKeys?: string[]
  hasAllKeys?: string[]
}

export type WhereAssociations<
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
  > = {
    [Key in keyof TAssociations]?: TAssociations[Key][0] extends FindBuilder<
      infer TDialect,
      infer TFields,
      infer TIds,
      infer TEnums,
      infer TAssociations,
      infer TMany,
      any,
      any,
      any
    >
    ? Where<TDialect, TFields, TIds, TEnums, TAssociations> & WhereAggregate<TDialect, TFields, TIds, TEnums, TMany>
    : {}
  }

export type WhereAggregate<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds,
  TEnums,
  TMany extends boolean
  > = TMany extends false
  ? {}
  : {
    [AggKey in keyof AggregateFields]?: {
      [Key in keyof TFields]?: TFields[Key] extends AggregateFields[AggKey]
      ? WhereFields<TDialect, TFields, TIds, TEnums>[Key]
      : never
    }
  } & { count?: NumberOperators }

export type WhereLogicOperators<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds,
  TEnums,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >
  > = {
    or?: Where<TDialect, TFields, TIds, TEnums, TAssociations>[]
    and?: Where<TDialect, TFields, TIds, TEnums, TAssociations>[]
    not?: Where<TDialect, TFields, TIds, TEnums, TAssociations>
  }

export type FromFindBuilder<T> = T extends FindBuilder<
  any,
  any,
  any,
  any,
  any,
  infer TMany,
  infer TSelected,
  infer TRawSelected,
  infer TLoaded
>
  ? TMany extends true
  ? (TSelected & TRawSelected & TLoaded)[]
  : (TSelected & TRawSelected & TLoaded) | null
  : never

export type FromPaginateBuilder<T> = T extends PaginateBuilder<
  any,
  any,
  any,
  any,
  any,
  infer TSelected,
  infer TRawSelected,
  infer TLoaded,
  infer TResult
>
  ? { [Key in keyof TResult]: Key extends 'results' ? (TSelected & TRawSelected & TLoaded)[] : TResult[Key] }
  : never
