import Knex = require('knex')
import { FindBuilder } from './find'

export type BuilderOptions = {
  knex: Knex
}

export type Models = Record<string, Model>

export type Model = {
  tableName: string
  primaryKey: string
  fields: Record<string, Field>
  include: string[]
  dependencies: Record<string, string[]>
  associations: Record<string, Association>
}

export type Field = {
  column: string
  hasDefault?: true
}

export type Association = {
  modelName: string
  isMany: boolean
  on: { from: string; to: string }[]
  through?: string
  builder: (options: BuilderOptions) => FindBuilder<any, any, any, any, any, any, any, any>
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

export type JSON = boolean | number | string | null | JSONArray | JSONMap
export interface JSONMap {
  [key: string]: JSON
}
export type JSONArray = Array<JSON>

export type AggregateFields = {
  sum: number
  avg: number
  min: number | string
  max: number | string
}

export type OrderByDirection = 'ASC' | 'DESC' | 'ASC_NULLS_LAST' | 'DESC_NULLS_LAST'

export type OrderBy<
  TFields extends Record<string, any>,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>
> = OrderByField<TFields> & OrderByAssociation<TAssociations>

export type OrderByField<TFields extends Record<string, any>> = {
  [Key in keyof TFields]?: OrderByDirection
}

export type OrderByAssociation<
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>
> = {
  [Key in keyof TAssociations]?: TAssociations[Key] extends FindBuilder<
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
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>
> = WhereFields<TFields, TIds, TEnums> &
  WhereAssociations<TAssociations> &
  WhereLogicOperators<TFields, TIds, TEnums, TAssociations>

export type WhereFields<TFields extends Record<string, any>, TIds extends string, TEnums> = {
  [Key in keyof TFields]?: Key extends TIds
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
  in?: string | number[]
  notIn?: string | number[]
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
  iLike?: string
  notILike?: string
  in?: string[]
  notIn?: string[]
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
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>
> = {
  [Key in keyof TAssociations]?: TAssociations[Key] extends FindBuilder<
    infer TFields,
    infer TIds,
    infer TEnums,
    infer TAssociations,
    infer TMany,
    any,
    any,
    any
  >
    ? Where<TFields, TIds, TEnums, TAssociations> & WhereAggregate<TFields, TIds, TEnums, TMany>
    : {}
}

export type WhereAggregate<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TMany extends boolean
> = TMany extends false
  ? {}
  : {
      [AggKey in keyof AggregateFields]?: {
        [Key in keyof TFields]?: TFields[Key] extends AggregateFields[AggKey]
          ? WhereFields<TFields, TIds, TEnums>[Key]
          : never
      }
    } & { count?: NumberOperators }

export type WhereLogicOperators<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any>>
> = {
  or?: Where<TFields, TIds, TEnums, TAssociations>[]
  and?: Where<TFields, TIds, TEnums, TAssociations>[]
  not?: Where<TFields, TIds, TEnums, TAssociations>
}

export type JoinedFromBuilder<T> = T extends FindBuilder<
  any,
  any,
  any,
  any,
  infer TMany,
  infer TSelected,
  infer TRawSelected,
  infer TJoined
>
  ? TMany extends true
    ? (TSelected & TRawSelected & TJoined)[]
    : (TSelected & TRawSelected & TJoined) | null
  : never
