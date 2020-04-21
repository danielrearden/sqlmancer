import _ from 'lodash'
import Knex from 'knex'

import {
  BuilderOptions,
  Dialect,
  Expressions,
  OrderBy,
  QueryBuilderContext,
  Models,
  Where,
  JoinedFromBuilder,
} from './types'
import { BaseBuilder } from './base'
import { getAlias, getJsonObjectFunctionByDialect } from './utilities'
import { parseResolveInfo, FlattenedResolveTree } from '../graphqlUtilities'
import { GraphQLResolveInfo } from 'graphql'

export abstract class FindBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any, any>>,
  TMany extends boolean = true,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TJoined extends Record<string, any> = {}
> extends BaseBuilder {
  protected readonly _isMany: boolean

  constructor(options: BuilderOptions, modelName: string, models: Models, isMany: boolean) {
    super(options, modelName, models)
    this._isMany = isMany
    this._limit = isMany ? 0 : 1
  }

  /**
   * Sets the SELECT clause for the query.
   */
  public select<T extends keyof TFields>(
    ...fields: T[]
  ): FindBuilder<TDialect, TFields, TIds, TEnums, TAssociations, TMany, Pick<TFields, T>, TRawSelected, TJoined> {
    this._select = fields
    return this
  }

  /**
   * Sets the SELECT clause for the query to all available fields.
   */
  public selectAll(): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TFields,
    TRawSelected,
    TJoined
  > {
    this._select = Object.keys(this._model.fields)
    return this
  }

  /**
   * Adds on to the SELECT clause for the query.
   */
  public addSelect<T extends keyof TFields>(
    ...fields: T[]
  ): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TSelected & Pick<TFields, T>,
    TRawSelected,
    TJoined
  > {
    this._select = [...this._select, ...fields]
    return this
  }

  /**
   * Adds an additional column to the SELECT clause under the provided alias.
   */
  public addSelectRaw<TColumn extends string, TAlias extends string = TColumn>(
    column: TColumn,
    as?: TAlias
  ): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TSelected,
    TRawSelected & { [key in TAlias]: any },
    TJoined
  > {
    this._rawSelect[as || column] = column
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

  /**
   * Eager loads the specified model relation. An optional alias can be provided to return the related model or models under a
   * different property name. The `getBuilder` parameter is a function that's passed a fresh `FindOneBuilder` or `FindManyBuilder`
   * instance for the associated model and should return the same kind of Builder instance.
   */
  public join<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (builder: TAssociations[TName]) => FindBuilder<any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName]
    ) => TAssociations[TName]
  >(
    name: TName,
    getBuilder?: TGetBuilder
  ): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TSelected,
    TRawSelected,
    TJoined &
      {
        [key in TName]: JoinedFromBuilder<ReturnType<TGetBuilder>>
      }
  >

  public join<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (builder: TAssociations[TName]) => FindBuilder<any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName]
    ) => TAssociations[TName]
  >(
    name: TName,
    as: TAlias,
    getBuilder?: TGetBuilder
  ): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TSelected,
    TRawSelected,
    TJoined &
      {
        [key in TAlias]: JoinedFromBuilder<ReturnType<TGetBuilder>>
      }
  >
  public join<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (builder: TAssociations[TName]) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName]
    ) => TAssociations[TName]
  >(name: TName, aliasOrGetBuilder?: TAlias | TGetBuilder, getBuilder?: TGetBuilder) {
    const association = this._model.associations[name]

    if (!association) {
      throw new Error(`Invalid association name: ${name}`)
    }

    const fieldName = typeof aliasOrGetBuilder === 'string' ? aliasOrGetBuilder : name
    const getBuilderFn = typeof aliasOrGetBuilder === 'string' ? getBuilder : aliasOrGetBuilder
    const initialBuilder = association.builder(this._options)
    this._joins[fieldName] = [
      name,
      getBuilderFn ? getBuilderFn(initialBuilder as TAssociations[TName]) : initialBuilder,
    ]

    return this
  }

  /**
   * Modifies the query based on the passed in GraphQLResolveInfo object. The selection set will determine what columns
   * should be selected and which related models should be joined. The `where`, `orderBy`, `limit` and `offset` arguments,
   * if they exist on the field and were provided, will be used to set the corresponding clauses in the query.
   */
  public resolveInfo(info: GraphQLResolveInfo | FlattenedResolveTree) {
    let tree: FlattenedResolveTree
    if ('path' in info) {
      tree = parseResolveInfo(info)!
    } else {
      tree = info
    }

    const { fields, args } = tree

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      if (field.name in this._model.fields) {
        this.addSelect(field.name)
      } else if (field.name in this._model.dependencies) {
        this._model.dependencies[field.name].forEach(columnName => this.addSelectRaw(columnName))
      } else if (field.name in this._model.associations) {
        this.join(field.name as Extract<keyof TAssociations, string>, field.alias, builder =>
          builder.resolveInfo(field)
        )
      }
    })

    const { where, orderBy, limit, offset } = args

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
   * Executes the query and returns a Promise that will resolve to the found row or rows.
   */
  public async execute<TRow = TSelected & TRawSelected & TJoined>() {
    const rows = await this.toQueryBuilder()

    // We use JSON aggregation for joins and SQLite returns those fields as strings
    if (this._dialect === 'sqlite') {
      const joinFields = Object.keys(this._joins)
      rows.forEach((row: any) => {
        Object.keys(row).forEach(fieldName => {
          if (joinFields.includes(fieldName)) {
            row[fieldName] = JSON.parse(row[fieldName])
          }
        })
      })
    }

    return (this._isMany ? rows : rows[0] || null) as TMany extends true ? TRow[] : TRow | null
  }

  /**
   * Compiles the query into a Knex QueryBuilder instance
   */
  public toQueryBuilder(context?: QueryBuilderContext): Knex.QueryBuilder {
    if (!context) {
      return this.toQueryBuilder({ alias: {} })
    }
    const tableAlias = getAlias(this._tableName, context)
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

    if (context.nested) {
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
    } else if (Object.keys(expressions.select).length) {
      query.select(expressions.select)
    } else {
      query.select(this._knex.raw('null'))
    }

    query.from({ [tableAlias]: this._tableName })

    expressions.join.forEach(join => (query as any)[join.type](join.table, join.on))

    expressions.where.forEach(whereArgs => (query.where as any)(...whereArgs))

    if (expressions.groupBy.length) {
      query.groupBy(expressions.groupBy)
    }

    if (expressions.orderBy.length) {
      query.orderBy(expressions.orderBy as any)
    }

    if (this._limit) {
      query.limit(this._limit)
    }

    if (this._offset) {
      query.offset(this._offset)
    }

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
