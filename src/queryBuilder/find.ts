import _ from 'lodash'
import Knex from 'knex'

import {
  BuilderOptions,
  Dialect,
  Expressions,
  FromAggregateBuilder,
  FromFindBuilder,
  OrderBy,
  QueryBuilderContext,
  Models,
  Where,
} from '../types'
import { BaseBuilder } from './base'
import { AggregateBuilder } from './aggregate'
import { getAlias, getJsonObjectFunctionByDialect } from './utilities'
import { parseResolveInfo, FlattenedResolveTree } from '../utilities'
import { GraphQLResolveInfo } from 'graphql'

export abstract class FindBuilder<
  TDialect extends Dialect,
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<
    string,
    [FindBuilder<any, any, any, any, any, any, any, any, any>, AggregateBuilder<any, any, any, any, any, any>]
  >,
  TMany extends boolean = true,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TLoaded extends Record<string, any> = {}
> extends BaseBuilder {
  protected readonly _isMany: boolean

  constructor(options: BuilderOptions, modelName: string, models: Models, isMany: boolean) {
    super(options, modelName, models)
    this._isMany = isMany
    this._limit = isMany ? 0 : 1
    this._select = Object.keys(this._model.fields)
  }

  /**
   * Sets the SELECT clause for the query.
   */
  public select<T extends keyof TFields>(
    ...fields: T[]
  ): FindBuilder<TDialect, TFields, TIds, TEnums, TAssociations, TMany, Pick<TFields, T>, TRawSelected, TLoaded> {
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
    TLoaded
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
    TLoaded
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
    TLoaded
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
  public load<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (builder: TAssociations[TName][0]) => FindBuilder<any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName][0]
    ) => TAssociations[TName][0]
  >(
    associationName: TName,
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
    TLoaded &
      {
        [key in TName]: FromFindBuilder<ReturnType<TGetBuilder>>
      }
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
  ): FindBuilder<
    TDialect,
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TMany,
    TSelected,
    TRawSelected,
    TLoaded &
      {
        [key in TAlias]: FromFindBuilder<ReturnType<TGetBuilder>>
      }
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

    const fieldName = typeof aliasOrGetBuilder === 'string' ? aliasOrGetBuilder : associationName
    const getBuilderFn = typeof aliasOrGetBuilder === 'string' ? getBuilder : aliasOrGetBuilder
    const builders = this._models[association.modelName].builders
    const Builder = association.isMany ? builders.findMany : builders.findOne
    const initialBuilder = new Builder(this._options)
    this._loadedAssociations[fieldName] = [
      associationName,
      getBuilderFn ? getBuilderFn(initialBuilder as TAssociations[TName][0]) : initialBuilder,
    ]

    return this
  }

  public loadAggregate<
    TName extends Extract<keyof TAssociations, string>,
    TAlias extends string,
    TGetBuilder extends (builder: TAssociations[TName][1]) => AggregateBuilder<any, any, any, any, any, any> = (
      builder: TAssociations[TName][1]
    ) => TAssociations[TName][1]
  >(
    associationName: TName,
    alias: TAlias,
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
    TLoaded &
      {
        [key in TAlias]: FromAggregateBuilder<ReturnType<TGetBuilder>>
      }
  > {
    const association = this._model.associations[associationName]

    if (!association) {
      throw new Error(`Invalid association name: ${associationName}`)
    }

    const Builder = this._models[association.modelName].builders.aggregate
    const initialBuilder = new Builder(this._options)
    this._loadedAggregates[alias] = [
      associationName,
      getBuilder ? getBuilder(initialBuilder as TAssociations[TName][1]) : initialBuilder,
    ]

    return this
  }

  /**
   * Modifies the query based on the passed in GraphQLResolveInfo object. The selection set will determine what columns
   * should be selected and which related models should be loaded. The `where`, `orderBy`, `limit` and `offset` arguments,
   * if they exist on the field and were provided, will be used to set the corresponding clauses in the query.
   *
   * An optional `path` parameter can be passed in when the model will be returned as part of a more deeply nested field.
   * For example, the type of the field being returned might be `CreatePostPayload` with a field named `post` and it's this
   * field we're populating using a PostFindOneBuilder instance. In this case, we would pass in a value of "post" for the
   * `path` to identify the correct selection set and arguments to be parsed. The path can be arbitrarily deep, with each
   * level separated by a period, for example: "result.post".
   */
  public resolveInfo(info: GraphQLResolveInfo | FlattenedResolveTree, path?: string) {
    let tree: FlattenedResolveTree
    if ('path' in info) {
      tree = parseResolveInfo(info)!
    } else {
      tree = info
    }

    if (path) {
      tree = _.get(
        tree,
        path
          .split('.')
          .map(fieldName => `fields.${fieldName}`)
          .join('.')
      )

      if (!tree) {
        return this
      }
    }

    const { fields, args } = tree

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName]
      if (field.name in this._model.fields) {
        this.addSelect(field.name)
      } else if (field.name in this._model.dependencies) {
        this._model.dependencies[field.name].forEach(columnName => this.addSelectRaw(columnName))
      } else if (field.name in this._model.associations) {
        this.load(field.name as Extract<keyof TAssociations, string>, field.alias, builder =>
          builder.resolveInfo(field)
        )
      } else if (field.name in this._model.aggregates) {
        this.loadAggregate(this._model.aggregates[field.name] as any, field.alias, builder =>
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
  public async execute<TRow = TSelected & TRawSelected & TLoaded>() {
    const rows = await this.toQueryBuilder()

    // We use JSON aggregation for loading related models and SQLite returns those fields as strings
    if (this._dialect === 'sqlite') {
      const jsonFields = [...Object.keys(this._loadedAssociations), ...Object.keys(this._loadedAggregates)]
      rows.forEach((row: any) => {
        Object.keys(row).forEach(fieldName => {
          if (jsonFields.includes(fieldName)) {
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

    if (this._tableName) {
      query.from({ [tableAlias]: this._tableName })
    } else {
      query.with(tableAlias, this._knex.raw(this._cte!)).from(tableAlias)
    }

    this._applyExpressions(query, expressions)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
