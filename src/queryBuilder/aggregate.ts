import _ from 'lodash'
import Knex from 'knex'
import { GraphQLResolveInfo } from 'graphql'

import { BaseBuilder } from './base'
import { FindBuilder } from './find'
import {
  AggregateNumberFields,
  AggregateStringOrNumberFields,
  Aggregates,
  BuilderOptions,
  Dialect,
  Expressions,
  OrderBy,
  Models,
  QueryBuilderContext,
  Where,
} from '../types'
import { getAlias } from './utilities'
import { parseResolveInfo, FlattenedResolveTree } from '../utilities'

export class AggregateBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >,
  TAggregates extends Record<string, any> = {}
> extends BaseBuilder {
  protected _aggregates: Aggregates<TFields> = []

  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models)
  }

  /**
   * Gets a count of all the records in the associated table
   */
  public count<TKey extends 'count'>(): AggregateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TAggregates & { [K in TKey]: number }
  > {
    this._aggregates.push({ fn: 'count' })
    return this
  }

  /**
   * Gets the average of the provided field
   */
  public avg<TKey extends 'avg', TField extends AggregateNumberFields<TFields>>(
    field: TField
  ): AggregateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TAggregates & { [K in TKey]: Record<TField, number> }
  > {
    this._aggregates.push({ fn: 'avg', field })
    return this
  }

  /**
   * Gets the sum of the provided field
   */
  public sum<TKey extends 'sum', TField extends AggregateNumberFields<TFields>>(
    field: TField
  ): AggregateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TAggregates & { [K in TKey]: Record<TField, number> }
  > {
    this._aggregates.push({ fn: 'sum', field })
    return this
  }

  /**
   * Gets the minimum value of the provided field, or null if no matching records are found
   */
  public min<TKey extends 'min', TField extends AggregateStringOrNumberFields<TFields>>(
    field: TField
  ): AggregateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TAggregates & { [K in TKey]: Record<TField, TFields[TField] | null> }
  > {
    this._aggregates.push({ fn: 'min', field })
    return this
  }

  /**
   * Gets the maximum value of the provided field, or null if no matching records are found
   */
  public max<TKey extends 'max', TField extends AggregateStringOrNumberFields<TFields>>(
    field: TField
  ): AggregateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TAggregates & { [K in TKey]: Record<TField, TFields[TField] | null> }
  > {
    this._aggregates.push({ fn: 'max', field })
    return this
  }

  /**
   * Sets the WHERE clause for the query.
   */
  public where(where: Where<TDialect, TFields, TIds, TEnums, TAssociations>) {
    this._where = where
    return this
  }

  /**
   * Deep merges the provided object with the existing WHERE options for the query.
   */
  public mergeWhere(where: Where<TDialect, TFields, TIds, TEnums, TAssociations>) {
    this._where = _.merge({}, this._where, where)
    return this
  }

  /**
   * Sets the ORDER BY clause for the query.
   */
  public orderBy(orderBy: OrderBy<TFields, TAssociations>[]) {
    this._orderBy = orderBy
    return this
  }

  /**
   * Sets the LIMIT for the query.
   */
  public limit(value: number) {
    this._limit = value
    return this
  }

  /**
   * Sets the OFFSET for the query.
   */
  public offset(value: number) {
    this._offset = value
    return this
  }

  public resolveInfo(info: GraphQLResolveInfo | FlattenedResolveTree) {
    let tree: FlattenedResolveTree
    if ('path' in info) {
      tree = parseResolveInfo(info)!
    } else {
      tree = info
    }

    const {
      fields: { count, avg, sum, min, max },
      args: { where, orderBy, limit, offset },
    } = tree

    if (count) {
      this.count()
    }

    if (avg) {
      Object.keys(avg.fields).forEach(fieldName => {
        if (fieldName in this._model.fields) {
          this.avg(fieldName as any)
        }
      })
    }

    if (sum) {
      Object.keys(sum.fields).forEach(fieldName => {
        if (fieldName in this._model.fields) {
          this.sum(fieldName as any)
        }
      })
    }

    if (min) {
      Object.keys(min.fields).forEach(fieldName => {
        if (fieldName in this._model.fields) {
          this.min(fieldName as any)
        }
      })
    }

    if (max) {
      Object.keys(max.fields).forEach(fieldName => {
        if (fieldName in this._model.fields) {
          this.max(fieldName as any)
        }
      })
    }

    if (!_.isNil(where)) {
      this.where(where)
    }

    if (!_.isNil(orderBy)) {
      this.orderBy(orderBy)
    }

    if (!_.isNil(limit)) {
      this.limit(limit)
    }

    if (!_.isNil(offset)) {
      this.offset(offset)
    }

    return this
  }

  /**
   * Executes the query and returns a Promise that will resolve to the number of rows that were updated
   */
  public async execute(): Promise<TAggregates> {
    const results = await this.toQueryBuilder()
    let agg = results[0].agg

    if (this._dialect === 'sqlite') {
      agg = JSON.parse(agg)
    }

    return agg as TAggregates
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(context?: QueryBuilderContext): Knex.QueryBuilder {
    if (!context) {
      return this.toQueryBuilder({ alias: {} })
    }

    const subqueryAlias = getAlias(this._tableName || this._modelName, context)
    const query = this._knex.queryBuilder()
    const jsonObjectFn = this._dialect === 'postgres' ? 'json_build_object' : 'json_object'
    const aggregatesByFunction = _.groupBy(this._aggregates, 'fn')
    const functions = Object.keys(aggregatesByFunction)

    query.select({
      agg: this._knex.raw(
        `${jsonObjectFn}(${functions.reduce((acc, fn, index) => {
          if (fn === 'count') {
            acc += `'count', coalesce(count(${this._knex.ref(`${subqueryAlias}.${this._model.primaryKey}`)}), 0)`
          } else {
            const fields = _.uniq(aggregatesByFunction[fn].map(agg => (agg as { field: string }).field))
            acc += `'${fn}', ${jsonObjectFn}(`
            fields.forEach((field, index) => {
              const { column, mappedType } = this._model.fields[field]
              const arg = this._knex.ref(`${subqueryAlias}.${column}`)
              acc += `'${field}', ${mappedType === 'number' ? `coalesce(${fn}(${arg}), 0)` : `${fn}(${arg})`}`
              if (index !== fields.length - 1) {
                acc += ', '
              }
            })
            acc += ')'
          }
          if (index !== functions.length - 1) {
            acc += ', '
          }
          return acc
        }, '')})`
      ),
    })

    query.from(this._getSubqueryBuilder(context).as(subqueryAlias))

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }

  protected _getSubqueryBuilder(context: QueryBuilderContext): Knex.QueryBuilder {
    const tableAlias = getAlias(this._tableName || this._modelName, context)
    const throughAlias =
      context.nested && context.nested.association.through ? getAlias(context.nested.association.through, context) : ''
    const expressions: Expressions = {
      select: {},
      join: [],
      where: [],
      groupBy: [],
      orderBy: [],
    }
    const columns = _.uniq(
      this._aggregates.reduce((acc, aggregate) => {
        if ('field' in aggregate) {
          const column = this._model.fields[aggregate.field as string].column
          acc.push(`${tableAlias}.${column}`)
        } else {
          acc.push(`${tableAlias}.${this._primaryKey}`)
        }
        return acc
      }, [] as string[])
    )

    this._addJoinExpressions(tableAlias, throughAlias, expressions, context)
    this._addOrderByExpressions(tableAlias, expressions, context)
    this._addWhereExpressions(tableAlias, throughAlias, expressions, context)

    const query = this._knex.queryBuilder()

    query.select(...columns)

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    this._applyExpressions(query, expressions)

    return query
  }
}
