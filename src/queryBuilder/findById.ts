import Knex from 'knex'

import { BuilderOptions, Expressions, QueryBuilderContext, Models, JoinedFromBuilder } from './types'
import { BaseBuilder } from './base'
import { FindBuilder } from './find'
import { getAlias } from './utilities'
import { GraphQLResolveInfo } from 'graphql'
import { parseResolveInfo } from '../graphqlUtilities'

export abstract class FindByIdBuilder<
  TFields extends Record<string, any>,
  TIds extends string,
  TEnums,
  TAssociations extends Record<string, FindBuilder<any, any, any, any, any, any, any, any, any>>,
  TSelected extends Pick<TFields, any> = TFields,
  TRawSelected extends Record<string, any> = {},
  TJoined extends Record<string, any> = {}
> extends BaseBuilder {
  protected _id: number | string

  constructor(options: BuilderOptions, tableName: string, models: Models, id: number | string) {
    super(options, tableName, models)
    this._id = id
  }

  /**
   * Sets the SELECT clause for the query.
   */
  public select<T extends keyof TFields>(
    ...fields: T[]
  ): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, Pick<TFields, T>, TRawSelected, TJoined> {
    this._select = fields
    return this
  }

  /**
   * Sets the SELECT clause for the query to all available fields.
   */
  public selectAll(): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, TFields, TRawSelected, TJoined> {
    this._select = Object.keys(this._model.fields)
    return this
  }

  /**
   * Adds on to the SELECT clause for the query.
   */
  public addSelect<T extends keyof TFields>(
    ...fields: T[]
  ): FindByIdBuilder<TFields, TIds, TEnums, TAssociations, TSelected & Pick<TFields, T>, TRawSelected, TJoined> {
    this._select = [...this._select, ...fields]
    return this
  }

  /**
   * Adds an additional column to the SELECT clause under the provided alias.
   */
  public addSelectRaw<TColumn extends string, TAlias extends string = TColumn>(
    column: TColumn,
    as?: TAlias
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
    TSelected,
    TRawSelected & { [key in TAlias]: any },
    TJoined
  > {
    this._rawSelect[as || column] = column
    return this
  }

  /**
   * Eager loads the specified association.
   */
  public join<
    TName extends Extract<keyof TAssociations, string>,
    TGetBuilder extends (builder: TAssociations[TName]) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName]
    ) => TAssociations[TName]
  >(
    name: TName,
    getBuilder?: TGetBuilder
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
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
    TGetBuilder extends (builder: TAssociations[TName]) => FindBuilder<any, any, any, any, any, any, any, any, any> = (
      builder: TAssociations[TName]
    ) => TAssociations[TName]
  >(
    name: TName,
    as: TAlias,
    getBuilder?: TGetBuilder
  ): FindByIdBuilder<
    TFields,
    TIds,
    TEnums,
    TAssociations,
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
   * Modifies the query based on the passed in GraphQLResolveInfo object.
   */
  public resolveInfo(info: GraphQLResolveInfo) {
    const { fields } = parseResolveInfo(info)!

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

    return this
  }

  /**
   * Executes the query and returns a Promise that will resolve to the found row.
   */
  public async execute<TRow = TSelected & TRawSelected & TJoined>() {
    const rows = await this.toQueryBuilder()
    return (rows[0] as TRow) || null
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

    this._addSelectExpressions(tableAlias, expressions, context)
    this._addJoinExpressions(tableAlias, throughAlias, expressions, context)

    const query = this._knex.queryBuilder()

    if (Object.keys(expressions.select).length) {
      query.select(expressions.select)
    } else {
      query.select(this._knex.raw('null'))
    }

    query.from({ [tableAlias]: this._tableName })

    expressions.join.forEach(join => (query as any)[join.type](join.table, join.on))

    query.where(`${tableAlias}.${this._primaryKey}`, this._id)

    expressions.where.forEach(whereArgs => (query.where as any)(...whereArgs))

    if (expressions.groupBy.length) {
      query.groupBy(expressions.groupBy)
    }

    query.limit(1)

    if (this._transaction) {
      query.transacting(this._transaction)
    }

    return query
  }
}
