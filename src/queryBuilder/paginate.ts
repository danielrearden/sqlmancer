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
  FromFindBuilder,
  OrderBy,
  Models,
  QueryBuilderContext,
  Where,
  FromPaginateBuilder,
} from '../types'
import { getAlias, getJsonObjectFunctionByDialect, getJsonAggregateExpressionByDialect } from './utilities'
import { parseResolveInfo, FlattenedResolveTree } from '../utilities'

export class PaginateBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [
      FindBuilder<any, any, any, any, any, any, any, any, any>,
      PaginateBuilder<any, any, any, any, any, any, any, any, any>
    ]
  >,
  TSelected extends Pick<TFields, any> = {},
  TRawSelected extends Record<string, any> = {},
  TLoaded extends Record<string, any> = {},
  TResult extends Record<string, any> = {}
> extends BaseBuilder {
  protected _aggregates: Aggregates<TFields> = []
  protected _includeHasMore = false
  protected _includeTotalCount = false

  constructor(options: BuilderOptions, modelName: string, models: Models) {
    super(options, modelName, models)

    this._select = []
    this._limit = 0
  }

  /**
   * Sets the SELECT clause for the query.
   */
  public select<T extends keyof TFields>(
    ...fields: T[]
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    Pick<TFields, T>,
    TRawSelected,
    TLoaded,
    TResult & { results: true }
  > {
    this._select = fields
    return this as any
  }

  /**
   * Sets the SELECT clause for the query to all available fields.
   */
  public selectAll(): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { results: true }
  > {
    this._select = Object.keys(this._model.fields)
    return this as any
  }

  /**
   * Adds on to the SELECT clause for the query.
   */
  public addSelect<T extends keyof TFields>(
    ...fields: T[]
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected & Pick<TFields, T>,
    TRawSelected,
    TLoaded,
    TResult & { results: true }
  > {
    this._select = [...this._select, ...fields]
    return this as any
  }

  /**
   * Adds an additional column to the SELECT clause under the provided alias.
   */
  public addSelectRaw<TColumn extends string, TAlias extends string = TColumn>(
    column: TColumn,
    as?: TAlias
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected & { [key in TAlias]: any },
    TLoaded,
    TResult & { results: true }
  > {
    this._rawSelect[as || column] = column
    return this as any
  }

  /**
   * Eager loads the specified model relation. An optional alias can be provided to return the related model or models under a
   * different property name. The `getBuilder` parameter is a function that's passed a fresh `FindOneBuilder` or `FindManyBuilder`
   * instance for the associated model and should return the same kind of Builder instance.
   */
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (builder: TAssociations[TName][0]) => FindBuilder<any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(
    associationName: TName,
    getBuilder?: TGetBuilder
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TName]: FromFindBuilder<ReturnType<TGetBuilder>>
      },
    TResult & { results: true }
  >
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (builder: TAssociations[TName][0]) => FindBuilder<any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(
    associationName: TName,
    as: TAlias,
    getBuilder?: TGetBuilder
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TAlias]: FromFindBuilder<ReturnType<TGetBuilder>>
      },
    TResult & { results: true }
  >
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (
      builder: TAssociations[TName][0]
    ) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(associationName: TName, aliasOrGetBuilder?: TAlias | TGetBuilder, getBuilder?: TGetBuilder) {
    const association = this._model.associations[associationName]

    if (!association) {
      throw new Error(`Invalid association name: ${associationName}`)
    }

    const alias = typeof aliasOrGetBuilder === 'string' ? aliasOrGetBuilder : associationName
    const getBuilderFn = typeof aliasOrGetBuilder === 'string' ? getBuilder : aliasOrGetBuilder
    const builders = this._models[association.modelName].builders
    const Builder = association.isMany ? builders.findMany : builders.findOne
    const initialBuilder = new Builder(this._options)
    this._loadedAssociations[alias] = [
      associationName,
      getBuilderFn ? getBuilderFn(initialBuilder as TAssociations[TName][0]) : initialBuilder,
    ]

    return this as any
  }

  public loadPaginated<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (
      builder: TAssociations[TName][1]
    ) => PaginateBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][1]
    ) => TAssociations[TName][1]
  >(
    associationName: TName,
    getBuilder?: TGetBuilder
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TName]: FromPaginateBuilder<ReturnType<TGetBuilder>>
      },
    TResult & { results: true }
  >
  public loadPaginated<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (
      builder: TAssociations[TName][1]
    ) => PaginateBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][1]
    ) => TAssociations[TName][1]
  >(
    associationName: TName,
    alias: TAlias,
    getBuilder?: TGetBuilder
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TAlias]: FromPaginateBuilder<ReturnType<TGetBuilder>>
      },
    TResult & { results: true }
  >
  public loadPaginated<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (
      builder: TAssociations[TName][1]
    ) => PaginateBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][1]
    ) => TAssociations[TName][1]
  >(associationName: TName, aliasOrGetBuilder?: TAlias | TGetBuilder, getBuilder?: TGetBuilder) {
    const association = this._model.associations[associationName]

    if (!association) {
      throw new Error(`Invalid association name: ${associationName}`)
    }

    const alias = typeof aliasOrGetBuilder === 'string' ? aliasOrGetBuilder : associationName
    const getBuilderFn = typeof aliasOrGetBuilder === 'string' ? getBuilder : aliasOrGetBuilder
    const Builder = this._models[association.modelName].builders.paginate
    const initialBuilder = new Builder(this._options)
    this._loadedPaginated[alias] = [
      associationName,
      getBuilderFn ? getBuilderFn(initialBuilder as TAssociations[TName][1]) : initialBuilder,
    ]

    return this as any
  }

  /**
   * Gets a count of all the records in the associated table matching the provided criteria.
   * The value is available under the "aggregate" property in the object returned when calling `execute`.
   */
  public count(): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { aggregate: { count: number } }
  > {
    this._aggregates.push({ fn: 'count' })
    return this as any
  }

  /**
   * Gets the average of the provided field.
   * The value is available under the "aggregate" property in the object returned when calling `execute`.
   */
  public avg<TField extends AggregateNumberFields<TFields>>(
    field: TField
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { aggregate: { avg: Record<TField, number> } }
  > {
    this._aggregates.push({ fn: 'avg', field })
    return this as any
  }

  /**
   * Gets the sum of the provided field.
   * The value is available under the "aggregate" property in the object returned when calling `execute`.
   */
  public sum<TField extends AggregateNumberFields<TFields>>(
    field: TField
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { aggregate: { sum: Record<TField, number> } }
  > {
    this._aggregates.push({ fn: 'sum', field })
    return this as any
  }

  /**
   * Gets the minimum value of the provided field, or null if no matching records are found.
   * The value is available under the "aggregate" property in the object returned when calling `execute`.
   */
  public min<TField extends AggregateStringOrNumberFields<TFields>>(
    field: TField
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { aggregate: { min: Record<TField, TFields[TField] | null> } }
  > {
    this._aggregates.push({ fn: 'min', field })
    return this as any
  }

  /**
   * Gets the maximum value of the provided field, or null if no matching records are found.
   * The value is available under the "aggregate" property in the object returned when calling `execute`.
   */
  public max<TField extends AggregateStringOrNumberFields<TFields>>(
    field: TField
  ): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { aggregate: { max: Record<TField, TFields[TField] | null> } }
  > {
    this._aggregates.push({ fn: 'max', field })
    return this as any
  }

  /**
   * Attaches the "hasMore" property to the object returned when calling `execute`. The property indicates whether
   * there are additional results that can be fetched.
   */
  public hasMore(): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { hasMore: TDialect extends 'postgres' ? boolean : 0 | 1 }
  > {
    this._includeHasMore = true
    return this as any
  }

  /**
   * Attaches the "totalCount" property to the object returned when calling `execute`. The property indicates the
   * total number of records matchinging the provided criteria, regardless of limit.
   */
  public totalCount(): PaginateBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TFields,
    TRawSelected,
    TLoaded,
    TResult & { totalCount: number }
  > {
    this._includeTotalCount = true
    return this as any
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
      fields: { results, aggregate, hasMore, totalCount },
      args: { where, orderBy, limit, offset },
    } = tree

    if (results) {
      Object.keys(results.fields).forEach((fieldName) => {
        const field = results.fields[fieldName]
        if (field.name in this._model.fields) {
          this.addSelect(field.name)
        } else if (field.name in this._model.dependencies) {
          this._model.dependencies[field.name].forEach((columnName) => this.addSelectRaw(columnName))
        } else if (field.name in this._model.associations) {
          const association = this._model.associations[field.name]
          if (association.pagination) {
            this.loadPaginated(field.name as Extract<keyof TAssociations, string>, field.alias, (builder) =>
              builder.resolveInfo(field)
            )
          } else {
            this.load(field.name as Extract<keyof TAssociations, string>, field.alias, (builder) =>
              builder.resolveInfo(field)
            )
          }
        }
      })
    }

    if (aggregate) {
      const { count, avg, sum, min, max } = aggregate.fields
      if (count) {
        this.count()
      }

      if (avg) {
        Object.keys(avg.fields).forEach((fieldName) => {
          if (fieldName in this._model.fields) {
            this.avg(fieldName as any)
          }
        })
      }

      if (sum) {
        Object.keys(sum.fields).forEach((fieldName) => {
          if (fieldName in this._model.fields) {
            this.sum(fieldName as any)
          }
        })
      }

      if (min) {
        Object.keys(min.fields).forEach((fieldName) => {
          if (fieldName in this._model.fields) {
            this.min(fieldName as any)
          }
        })
      }

      if (max) {
        Object.keys(max.fields).forEach((fieldName) => {
          if (fieldName in this._model.fields) {
            this.max(fieldName as any)
          }
        })
      }
    }

    if (hasMore) {
      this.hasMore()
    }

    if (totalCount) {
      this.totalCount()
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
  public async execute(): Promise<
    { [Key in keyof TResult]: Key extends 'results' ? (TSelected & TRawSelected & TLoaded)[] : TResult[Key] }
  > {
    const results = await this.toQueryBuilder()
    let page = results[0].page

    if (this._dialect === 'sqlite') {
      page = JSON.parse(page)
    }

    return page
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(context?: QueryBuilderContext): Knex.QueryBuilder {
    if (!context) {
      return this.toQueryBuilder({ alias: {} })
    }

    const query = this._knex.queryBuilder()
    const jsonObjectFn = getJsonObjectFunctionByDialect(this._dialect)
    const includeResults =
      this._select.length || Object.keys(this._loadedAssociations).length || Object.keys(this._loadedPaginated).length
    const includeAggregate = !!this._aggregates.length
    const keyValuePairs = []
    const bindings = []

    if (includeResults) {
      keyValuePairs.push(`'results', ?`)
      bindings.push(this._getResultsValue(context))
    }

    if (includeAggregate) {
      keyValuePairs.push(`'aggregate', ?`)
      bindings.push(this._getAggregateValue(context))
    }

    if (this._includeHasMore) {
      keyValuePairs.push(`'hasMore', ?`)
      bindings.push(this._getHasMoreValue(context))
    }

    if (this._includeTotalCount) {
      keyValuePairs.push(`'totalCount', ?`)
      bindings.push(this._getTotalCountValue(context))
    }

    query.select({
      page: this._knex.raw(`${jsonObjectFn}(${keyValuePairs.join(', ')})`, bindings),
    })

    return query
  }

  protected _getResultsValue(context: QueryBuilderContext): Knex.RawBinding {
    const subqueryAlias = getAlias(this._tableName || this._modelName, context)
    const jsonAggExpression = getJsonAggregateExpressionByDialect(
      this._dialect,
      true,
      this._knex.ref(`${subqueryAlias}.o`)
    )

    const query = this._knex.queryBuilder()

    query.select(this._knex.raw(jsonAggExpression))

    query.from(this._getResultsSubqueryBuilder(context).as(subqueryAlias))

    return query
  }

  protected _getResultsSubqueryBuilder(context: QueryBuilderContext): Knex.QueryBuilder {
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

    this._addOrderByExpressions(tableAlias, expressions, context)
    this._addSelectExpressions(tableAlias, expressions, context)
    this._addJoinExpressions(tableAlias, throughAlias, expressions, context)
    this._addWhereExpressions(tableAlias, throughAlias, expressions, context)

    const query = this._knex.queryBuilder()

    const fields = _.toPairs(expressions.select)
    const jsonObjectFn = getJsonObjectFunctionByDialect(this._dialect)
    query.select(
      this._knex.raw(
        `${jsonObjectFn}(${fields
          .map(([fieldName, value]) => `'${fieldName}', ${value.constructor.name === 'Builder' ? '(??)' : '??'}`)
          .join(', ')}) as ${this._knex.ref('o')}`,
        fields.map(([, value]) => value)
      )
    )

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    this._applyExpressions(query, expressions)

    return query
  }

  protected _getAggregateValue(context: QueryBuilderContext): Knex.RawBinding {
    const subqueryAlias = getAlias(this._tableName || this._modelName, context)
    const jsonObjectFn = this._dialect === 'postgres' ? 'json_build_object' : 'json_object'
    const aggregatesByFunction = _.groupBy(this._aggregates, 'fn')
    const functions = Object.keys(aggregatesByFunction)
    const query = this._knex.queryBuilder()

    query.select(
      this._knex.raw(
        `${jsonObjectFn}(${functions.reduce((acc, fn, index) => {
          if (fn === 'count') {
            acc += `'count', coalesce(count(${this._knex.ref(`${subqueryAlias}.${this._model.primaryKey}`)}), 0)`
          } else {
            const fields = _.uniq(aggregatesByFunction[fn].map((agg) => (agg as { field: string }).field))
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
      )
    )

    query.from(this._getAggregateSubqueryBuilder(context).as(subqueryAlias))

    return query
  }

  protected _getAggregateSubqueryBuilder(context: QueryBuilderContext): Knex.QueryBuilder {
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

  protected _getHasMoreValue(context: QueryBuilderContext): Knex.RawBinding {
    if (!this._limit) {
      return this._knex.raw('false')
    }

    const tableAlias = getAlias(this._tableName || this._modelName, context)
    const query = this._knex.queryBuilder()

    query.select(
      this._knex.raw(
        `coalesce(count(${this._knex.ref(`${tableAlias}.${this._model.primaryKey}`)}), 0) > ${
          (this._limit || 0) + (this._offset || 0)
        }`
      )
    )

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    return query
  }

  protected _getTotalCountValue(context: QueryBuilderContext): Knex.RawBinding {
    const subqueryAlias = getAlias(this._tableName || this._modelName, context)
    const query = this._knex.queryBuilder()

    query.select(this._knex.raw(`coalesce(${this._knex.ref(`${subqueryAlias}.count`)}, 0)`))

    query.from(this._getTotalCountSubqueryBuilder(context).as(subqueryAlias))

    return query
  }

  protected _getTotalCountSubqueryBuilder(context: QueryBuilderContext): Knex.QueryBuilder {
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

    this._addJoinExpressions(tableAlias, throughAlias, expressions, context)
    this._addWhereExpressions(tableAlias, throughAlias, expressions, context)

    const query = this._knex.queryBuilder()

    query.select(this._knex.raw(`count(${this._knex.ref(`${tableAlias}.${this._primaryKey}`)}) as count`))

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    this._applyExpressions(query, expressions, false)

    return query
  }
}
